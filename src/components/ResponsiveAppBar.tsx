'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
        NavigationMenu,
        NavigationMenuItem,
        NavigationMenuLink,
        NavigationMenuList,
        NavigationMenuTrigger,
        NavigationMenuContent,
} from '@/components/ui/navigation-menu'
import { Sheet, SheetTrigger, SheetHeader, SheetTitle, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import ModeToggle from '@/components/ModeToggle'
import UserButton from '@/components/UserButton'

export default function ResponsiveAppBar() {
        const pathname = usePathname()

        return (
                <header className="border-b bg-card px-4 flex items-center justify-between">
                        {/* Burger menu visible uniquement en mobile */}
                        <div className="md:hidden">
                                <Sheet>
                                        <SheetTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                        <Menu className="h-6 w-6" />
                                                </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left">
                                                <SheetHeader>
                                                        <SheetTitle>Menu</SheetTitle>
                                                </SheetHeader>
                                                <nav className="flex flex-col gap-4 mt-8">
                                                        <Link href="/dashboard" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Accueil</Link>
                                                        <Link href="/performances/objectifs" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Objectifs</Link>
                                                        <Link href="/performances/statistiques" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Statistiques</Link>
                                                        <Link href="/calendar" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Calendrier</Link>
                                                        <Link href="/animals" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Animaux</Link>
                                                        <Link href="/souhaits" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Souhaits</Link>
                                                        <Link href="/notes" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Notes</Link>
                                                        <Link href="/contacts" className='px-2 py-1.5 hover:bg-accent hover:text-primary'>Contacts</Link>
                                                </nav>
                                        </SheetContent>
                                </Sheet>
                        </div>

                        {/* Logo centré sur desktop */}
                        <div className={"flex md:flex-row items-center"}>
                                <Link href="/dashboard">
                                        <img src="/logo.png" alt="Logo" className="h-15 w-auto" />
                                </Link>
                                <span className='text-primary'>Vasco and co</span>
                        </div>

                        {/* Menu centré desktop */}
                        <nav className="hidden md:flex mx-auto">
                                <NavigationMenu viewport={false}>
                                        <NavigationMenuList className="flex gap-3 items-center">
                                                <NavigationMenuItem>
                                                        <NavigationMenuLink asChild>
                                                                <Link
                                                                        href="/dashboard"
                                                                        className={`text-sm font-medium hover:text-primary ${pathname === '/dashboard' && 'bg-accent text-primary'
                                                                                }`}
                                                                >
                                                                        Accueil
                                                                </Link>
                                                        </NavigationMenuLink>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                        <NavigationMenuTrigger className={`text-sm font-medium ${( pathname.includes('/performances') ) && 'bg-accent text-primary'}`}>Performances</NavigationMenuTrigger>
                                                        <NavigationMenuContent className="z-50">
                                                                <ul className="grid gap-2 w-48">
                                                                        <Link
                                                                                href="/performances/objectives"
                                                                                className={`text-sm rounded-sm px-2 py-1.5 hover:bg-accent hover:text-primary ${pathname === '/performances/objectifs' && 'bg-accent text-primary'
                                                                                        }`}
                                                                        >
                                                                                <li>
                                                                                        Objectifs
                                                                                </li>
                                                                        </Link>
                                                                        <Link
                                                                                href="/performances/statistiques"
                                                                                className={`text-sm rounded-sm px-2 py-1.5 hover:bg-accent hover:text-primary ${pathname === '/performances/statistiques' && 'bg-accent text-primary'
                                                                                        }`}
                                                                        >
                                                                                <li>
                                                                                        Statistiques
                                                                                </li>
                                                                        </Link>
                                                                </ul>
                                                        </NavigationMenuContent>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                        <NavigationMenuLink asChild>
                                                                <Link
                                                                        href="/calendar"
                                                                        className={`text-sm font-medium hover:text-primary ${pathname === '/calendar' && 'bg-accent text-primary'
                                                                                }`}
                                                                >
                                                                        Calendrier
                                                                </Link>
                                                        </NavigationMenuLink>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                        <NavigationMenuLink asChild>
                                                                <Link
                                                                        href="/animals"
                                                                        className={`text-sm font-medium hover:text-primary ${pathname === '/animaux' && 'bg-accent text-primary'
                                                                                }`}
                                                                >
                                                                        Animaux
                                                                </Link>
                                                        </NavigationMenuLink>
                                                </NavigationMenuItem>

                                                <NavigationMenuItem>
                                                        <NavigationMenuTrigger className={`text-sm font-medium ${pathname.includes('/autre') && 'bg-accent text-primary'}`}>Autre</NavigationMenuTrigger>
                                                        <NavigationMenuContent className="z-50">
                                                                <ul className="grid gap-2 w-48">
                                                                        <Link
                                                                                href="/souhaits"
                                                                                className={`text-sm rounded-sm px-2 py-1.5 hover:bg-accent hover:text-primary ${pathname === '/autre/souhaits' && 'bg-accent text-primary'
                                                                                        }`}
                                                                        >
                                                                                <li>
                                                                                        Souhaits
                                                                                </li>
                                                                        </Link>
                                                                        <Link
                                                                                href="/notes"
                                                                                className={`text-sm rounded-sm px-2 py-1.5 hover:bg-accent hover:text-primary ${pathname === '/autre/notes' && 'bg-accent text-primary'
                                                                                        }`}
                                                                        >
                                                                                <li>
                                                                                        Notes
                                                                                </li>
                                                                        </Link>
                                                                        <Link
                                                                                href="/contacts"
                                                                                className={`text-sm rounded-sm px-2 py-1.5 hover:bg-accent hover:text-primary ${pathname === '/autre/contacts' && 'bg-accent text-primary'
                                                                                        }`}
                                                                        >
                                                                                <li>
                                                                                        Contacts
                                                                                </li>
                                                                        </Link>
                                                                </ul>
                                                        </NavigationMenuContent>
                                                </NavigationMenuItem>
                                        </NavigationMenuList>
                                </NavigationMenu>
                        </nav>

                        {/* Boutons à droite (Mode + Profil) */}
                        <div className="flex items-center gap-2">
                                <ModeToggle />
                                <UserButton />
                        </div>
                </header>
        )
}
