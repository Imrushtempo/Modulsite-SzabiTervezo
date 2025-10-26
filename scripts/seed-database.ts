// Seed script for Szabi Tervező test data
// Run: npx tsx scripts/seed-database.ts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://stzjhrcvyzbazaaptzqy.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0empocmN2eXpiYXphYXB0enF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjEzODMyOSwiZXhwIjoyMDcxNzE0MzI5fQ.-jssxn9RTSyWnLimbhS-PrFrPm26z6T1DX--XMwNAD4'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const TENANT_ID = '00000000-0000-0000-0000-000000000099'

async function seed() {
  console.log('🌱 Starting database seed for Szabi Tervező...\n')

  try {
    // 1. Create Leave Types
    console.log('📝 Creating leave types...')
    const { data: leaveTypes, error: typesError } = await supabase
      .from('leave_types')
      .upsert([
        {
          id: '10000000-0000-0000-0000-000000000001',
          tenant_id: TENANT_ID,
          name: 'Éves szabadság',
          code: 'ANNUAL',
          is_paid: true,
          color: '#3B82F6',
          requires_approval: true,
        },
        {
          id: '10000000-0000-0000-0000-000000000002',
          tenant_id: TENANT_ID,
          name: 'Fizetés nélküli szabadság',
          code: 'UNPAID',
          is_paid: false,
          color: '#9CA3AF',
          requires_approval: true,
        },
        {
          id: '10000000-0000-0000-0000-000000000003',
          tenant_id: TENANT_ID,
          name: 'Orvosi szabadság',
          code: 'MEDICAL',
          is_paid: true,
          color: '#EF4444',
          requires_approval: true,
        },
      ], { onConflict: 'tenant_id,code' })
      .select()

    if (typesError) {
      console.error('❌ Leave types error:', typesError)
      throw typesError
    }
    console.log(`✅ Created ${leaveTypes?.length || 0} leave types`)

    // 2. Create Leave Balances
    console.log('\n💰 Creating leave balances...')
    const { data: balances, error: balancesError } = await supabase
      .from('leave_balance')
      .upsert([
        // Kovács Anna
        {
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000002',
          leave_type_id: '10000000-0000-0000-0000-000000000001',
          year: 2025,
          total_days: 20,
          used_days: 5,
          pending_days: 0,
        },
        {
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000002',
          leave_type_id: '10000000-0000-0000-0000-000000000003',
          year: 2025,
          total_days: 5,
          used_days: 0,
          pending_days: 0,
        },
        // Szabó Gábor
        {
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000003',
          leave_type_id: '10000000-0000-0000-0000-000000000001',
          year: 2025,
          total_days: 20,
          used_days: 2,
          pending_days: 3,
        },
        {
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000003',
          leave_type_id: '10000000-0000-0000-0000-000000000003',
          year: 2025,
          total_days: 5,
          used_days: 1,
          pending_days: 0,
        },
      ], { onConflict: 'tenant_id,user_id,leave_type_id,year' })
      .select()

    if (balancesError) {
      console.error('❌ Balances error:', balancesError)
      throw balancesError
    }
    console.log(`✅ Created ${balances?.length || 0} leave balances`)

    // 3. Create Sample Leave Requests
    console.log('\n📋 Creating sample leave requests...')
    const { data: requests, error: requestsError } = await supabase
      .from('leave_requests')
      .upsert([
        // Approved request
        {
          id: '20000000-0000-0000-0000-000000000001',
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000002',
          leave_type_id: '10000000-0000-0000-0000-000000000001',
          start_date: '2025-02-10',
          end_date: '2025-02-14',
          days_count: 5,
          status: 'approved',
          reason: 'Családi nyaralás',
          approved_by: '00000000-0000-0000-0000-000000000001',
          approved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        // Pending request
        {
          id: '20000000-0000-0000-0000-000000000002',
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000003',
          leave_type_id: '10000000-0000-0000-0000-000000000001',
          start_date: '2025-03-15',
          end_date: '2025-03-17',
          days_count: 3,
          status: 'pending',
          reason: 'Hosszú hétvége',
        },
        // Rejected request
        {
          id: '20000000-0000-0000-0000-000000000003',
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000003',
          leave_type_id: '10000000-0000-0000-0000-000000000001',
          start_date: '2025-02-20',
          end_date: '2025-02-21',
          days_count: 2,
          status: 'rejected',
          reason: 'Üzleti találkozó',
          rejected_by: '00000000-0000-0000-0000-000000000001',
          rejected_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          rejection_reason: 'Nincs elegendő fedezet ebben az időszakban',
        },
        // Another pending request
        {
          id: '20000000-0000-0000-0000-000000000004',
          tenant_id: TENANT_ID,
          user_id: '00000000-0000-0000-0000-000000000002',
          leave_type_id: '10000000-0000-0000-0000-000000000003',
          start_date: '2025-03-05',
          end_date: '2025-03-05',
          days_count: 1,
          status: 'pending',
          reason: 'Orvosi vizsgálat',
        },
      ], { onConflict: 'id' })
      .select()

    if (requestsError) {
      console.error('❌ Requests error:', requestsError)
      throw requestsError
    }
    console.log(`✅ Created ${requests?.length || 0} leave requests`)

    console.log('\n✨ Database seed completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Leave Types: ${leaveTypes?.length || 0}`)
    console.log(`   - Leave Balances: ${balances?.length || 0}`)
    console.log(`   - Leave Requests: ${requests?.length || 0}`)
    console.log('\n🎉 Ready to test at http://localhost:3000')

  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

seed()
