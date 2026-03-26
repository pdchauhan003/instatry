'use client'
import { QueryClient,QueryClientProvider } from "@tanstack/react-query"; // for tanstack query
import { useState } from "react";
import {Provider} from 'react-redux';
import { store } from '@/redux/store' // for redux store
function Providers({children}){
    const[client]=useState(new QueryClient());

    return(
        <>
            <QueryClientProvider client={client}>
                <Provider store={store}>
                        {children}    
                </Provider>
            </QueryClientProvider>
        </>
    )
}

export default Providers;