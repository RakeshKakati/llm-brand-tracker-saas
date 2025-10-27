"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check localStorage first
        const sessionData = localStorage.getItem('session');
        if (sessionData) {
          const parsedSession = JSON.parse(sessionData);
          const { data: { session }, error } = await supabase.auth.setSession(parsedSession);
          
          if (error) {
            console.error("Session error:", error);
            localStorage.removeItem('session');
            localStorage.removeItem('user');
            setUser(null);
            setSession(null);
          } else {
            setSession(session);
            setUser(session?.user || null);
          }
        } else {
          // Try to get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Get session error:", error);
          } else {
            setSession(session);
            setUser(session?.user || null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
        setUser(session?.user || null);
        
        if (session) {
          localStorage.setItem('session', JSON.stringify(session));
          localStorage.setItem('user', JSON.stringify(session.user));
        } else {
          localStorage.removeItem('session');
          localStorage.removeItem('user');
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem('session');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    session,
    loading,
    signOut
  };
}


