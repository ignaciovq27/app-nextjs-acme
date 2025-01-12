//COMPONENTS
import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';

//FETCH DATA
// import { fetchRevenue } from '@/app/lib/data';
// import { fetchLatestInvoices } from '@/app/lib/data';
// import { fetchCardData } from '@/app/lib/data';

//SUSPENSE
import { Suspense } from 'react';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';
import { LatestInvoicesSkeleton } from '@/app/ui/skeletons';
import { CardsSkeleton } from '@/app/ui/skeletons';

//GROUPING COMPONENTS IN A WRAPPER
import CardWrapper from '@/app/ui/dashboard/cards';

//FONTS
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
    // const revenue = await fetchRevenue();
    // const latestInvoices = await fetchLatestInvoices();
    // const {
    //     totalPaidInvoices,
    //     totalPendingInvoices,
    //     numberOfInvoices,
    //     numberOfCustomers,
    // } = await fetchCardData();

    return (
        <main>
            {/* TITLE */}
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>

            {/* CARDS */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
                <Card
                    title="Total Customers"
                    value={numberOfCustomers}
                    type="customers"
                />
                <Card title="Paid Collected" value={totalPaidInvoices} type="collected" />
                <Card title="Pending" value={totalPendingInvoices} type="pending" />
            </div> */}

            {/* REVENUE & INVOICES */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">

                {/* <RevenueChart revenue={revenue} /> */}
                <Suspense fallback={<RevenueChartSkeleton />}>
                    <RevenueChart />
                </Suspense>

                {/* <LatestInvoices latestInvoices={latestInvoices} /> */}
                <Suspense fallback={<LatestInvoicesSkeleton />}>
                    <LatestInvoices />
                </Suspense>
            </div>
        </main>
    );
}