'use client'

import Link from 'next/link'
import { headers } from 'next/headers';

export default function NotFoundContent(){
    async function PreviousPage(){
            const headersList = await headers();
            const referer = headersList.get('referer') || '/'; //URL de la page précédente
            return (referer.toString());
    }
    return (
            <div className="justify-self-center self-auto size-fit flex flex-col pt-32 bg-[url(/logo.png)] bg-size-[83%_auto] bg-position-[center_top_120px] bg-no-repeat">
                    <p className="flex-wrap text-lg bg-white shadow-[0px_0px_4px_1px] shadow-white max-w-2xl text-center p-1 rounded-2xl mb-60">Oups… Cette page est partie galoper ailleurs. Elle est peut-être encore en construction, introuvable pour le moment ou momentanément inaccessible.</p>
                    <Link href={PreviousPage()} className="self-center text-xl text-white bg-baie rounded-3xl py-3 px-5 border-3 border-background size-fit mt-32">
                        Revenir sur la page {PreviousPage()}
                </Link>
            </div>
            );
}