import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DatabaseService } from './dbStore';

export interface RealtimeSubscriptionHandlers {
  onPaymentSubmissionChange?: () => void;
  onRentRecordChange?: () => void;
  onWaterRecordChange?: () => void;
  onTenantInfoChange?: () => void;
  onCustomerLoginChange?: () => void;
  onAdminUserChange?: () => void;
}

/**
 * Sets up Supabase Realtime listeners for all 6 tables:
 * - admin_users
 * - customer_logins
 * - tenant_infos
 * - rent_records
 * - water_records
 * - payment_submissions
 */
export function initializeSupabaseRealtime(handlers?: RealtimeSubscriptionHandlers) {
  if (!isSupabaseConfigured() || !supabase) {
    return () => {};
  }

  const channel = supabase
    .channel('public:tenanthub-realtime')
    // 1. Payment Submissions
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'payment_submissions' },
      async () => {
        console.log('[Supabase Realtime] payment_submissions updated');
        await DatabaseService.syncFromSupabase();
        handlers?.onPaymentSubmissionChange?.();
      }
    )
    // 2. Rent Records
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rent_records' },
      async () => {
        console.log('[Supabase Realtime] rent_records updated');
        await DatabaseService.syncFromSupabase();
        handlers?.onRentRecordChange?.();
      }
    )
    // 3. Water Records
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'water_records' },
      async () => {
        console.log('[Supabase Realtime] water_records updated');
        await DatabaseService.syncFromSupabase();
        handlers?.onWaterRecordChange?.();
      }
    )
    // 4. Tenant Info
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tenant_infos' },
      async () => {
        console.log('[Supabase Realtime] tenant_infos updated');
        await DatabaseService.syncFromSupabase();
        handlers?.onTenantInfoChange?.();
      }
    )
    // 5. Customer Logins
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customer_logins' },
      async () => {
        console.log('[Supabase Realtime] customer_logins updated');
        await DatabaseService.syncFromSupabase();
        handlers?.onCustomerLoginChange?.();
      }
    )
    // 6. Admin Users
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'admin_users' },
      async () => {
        console.log('[Supabase Realtime] admin_users updated');
        await DatabaseService.syncFromSupabase();
        handlers?.onAdminUserChange?.();
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to live channel');
      }
    });

  // Return teardown function
  return () => {
    supabase.removeChannel(channel);
  };
}
