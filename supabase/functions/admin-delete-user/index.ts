import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase function environment is missing required credentials.");
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

function respond(status: number, body: Record<string, unknown>) {
    return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async request => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return respond(405, { error: "Method not allowed." });
    }

    const authorization = request.headers.get("Authorization");
    const token = authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
        return respond(401, { error: "Sign in as an administrator to continue." });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) {
        return respond(401, { error: "Your session is invalid or has expired." });
    }

    const { data: callerProfile, error: callerProfileError } = await userClient
        .from("profiles")
        .select("role, username")
        .eq("id", userData.user.id)
        .single();

    if (
        callerProfileError ||
        callerProfile?.role !== "admin" ||
        callerProfile?.username?.trim().toLowerCase() !== "admin2004"
    ) {
        return respond(403, { error: "Only the administrator can delete student accounts." });
    }

    let body: { userId?: unknown };
    try {
        body = await request.json();
    } catch {
        return respond(400, { error: "Request body must be valid JSON." });
    }

    if (typeof body.userId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.userId)
    ) {
        return respond(400, { error: "A valid student account ID is required." });
    }

    if (body.userId === userData.user.id) {
        return respond(400, { error: "You cannot delete your own administrator account." });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    });
    const { data: targetProfile, error: targetProfileError } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", body.userId)
        .maybeSingle();

    if (targetProfileError) {
        console.error("Could not verify target profile:", targetProfileError);
        return respond(500, { error: "Could not verify the student account." });
    }

    if (!targetProfile) {
        return respond(404, { error: "Student account was not found." });
    }

    if (targetProfile.role !== "student") {
        return respond(403, { error: "Only student accounts can be deleted here." });
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(body.userId);
    if (deleteError) {
        console.error("Could not delete student account:", deleteError);
        return respond(500, { error: deleteError.message });
    }

    return respond(200, { success: true });
});
