'use client'
import { QueryClient,QueryClientProvider } from "@tanstack/react-query"; // for tanstack query
import { useState } from "react";
import {Provider} from 'react-redux';
import { store } from '@/redux/store' // for redux store
import SessionHydrator from '@/Componants/SessionHydrator';
function Providers({children}){
    const[client]=useState(new QueryClient());

    return(
        <>
            <QueryClientProvider client={client}>
                <Provider store={store}>
                        <SessionHydrator />
                        {children}    
                </Provider>
            </QueryClientProvider>
        </>
    )
}

export default Providers;