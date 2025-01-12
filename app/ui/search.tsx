'use client';

//HOOKS
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { useDebouncedCallback } from 'use-debounce';  // Import the useDebouncedCallback hook from the use-debounce library

//COMPONENTS

//ICONS
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Search({ placeholder }: { placeholder: string }) {

  const searchParams = useSearchParams();  // Get the current URL search params
  const pathname = usePathname();  // Get the current URL pathname
  const { replace } = useRouter();  // Get the router object

  // Define the handleSearch function
  // function handleSearch(term: string) {
  //   // console.log(term);
  //   console.log(`Searching... ${term}`);

  //   const params = new URLSearchParams(searchParams);
  //   if (term) {
  //     params.set('query', term);
  //   } else {
  //     params.delete('query');
  //   }
  //   console.log(params);

  //   // Update the URL with the "user new input search term" as a query parameter
  //   // e.g. /dashboard/invoices?query=term
  //   replace(`${pathname}?${params.toString()}`);
  // }

  // Debounce the handleSearch function to prevent the search from running on every keystroke
  const handleSearch = useDebouncedCallback((term) => {
    // console.log(term);
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);

    params.set('page', '1');  // Reset the page number to 1 when a new search term is entered

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    console.log(params);

    // Update the URL with the "user new input search term" as a query parameter
    // e.g. /dashboard/invoices?query=term
    replace(`${pathname}?${params.toString()}`);
  }, 300);  // Set the debounce time to 300ms

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}  // Set the input value to the current query parameter value if it exists in the URL.

      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
