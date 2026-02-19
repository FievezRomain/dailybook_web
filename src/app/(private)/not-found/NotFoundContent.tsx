'use client';

import Link from 'next/link'

export default function NotFoundContent(previousPage: string | null){
    return (
        <div className="justify-self-center self-auto size-fit flex flex-col pt-32">
                <p className="flex-wrap text-lg bg-white shadow-[0px_0px_4px_1px] shadow-white max-w-2xl text-center p-1 rounded-2xl mb-60">Oups… Cette page est partie galoper ailleurs. Elle est peut-être encore en construction, introuvable pour le moment ou momentanément inaccessible.</p>
                <Link href="#" className="self-center text-xl text-white bg-baie rounded-3xl py-3 px-5 border-4 border-background size-fit mt-24">
                    Revenir sur la page
            </Link>
        </div>

    );
}