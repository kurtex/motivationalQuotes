"use client";

import React, { Suspense } from 'react';
import MetaRedirection from '../components/MetaRedirection';

const RedirectPage: React.FC = () => {

    return <Suspense><MetaRedirection /></Suspense>;
};

export default RedirectPage;