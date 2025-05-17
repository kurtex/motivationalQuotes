"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';

const MetaRedirection: React.FC = () => {

    const params = useSearchParams();
    const redirect = useRouter();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {

        const shortLiveToken = async () => {

            const code = params.get('code');
            const state = params.get('state');

            if (!code && !state) {
                redirect.push('/');
                return;
            }

            if (state !== process.env.NEXT_PUBLIC_API_STATE) {
                console.error("Wrong request");
                redirect.push('/error');
                return;
            }

            try {

                const response = await axios.post('/api/threads/auth', { code });

                if (response.status === 200) {

                    redirect.push('/');
                    return;
                }

            } catch (error) {
                console.error("Error getting the token:", error);
                redirect.push('/error');
                return;
            } finally {
                setLoading(false);
            }
        };

        shortLiveToken();

    }, [params, redirect]);

    return (loading ? <Loader /> : null);
};

export default MetaRedirection;