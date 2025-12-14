import { PrivateLayout } from '@/components/layout/PrivateLayout';
import { AnimalProvider } from '@/context/AnimalContext';
import { ContactProvider } from '@/context/ContactContext';
import { EventProvider } from '@/context/EventContext';
import { GroupProvider } from '@/context/GroupContext';
import { NoteProvider } from '@/context/NoteContext';
import { ObjectiveProvider } from '@/context/ObjectiveContext';
import { UserProvider } from '@/context/UserContext';
import { WishProvider } from '@/context/WishContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <>
            <UserProvider>
                <EventProvider>
                    <GroupProvider>
                        <ObjectiveProvider>
                            <AnimalProvider>
                                <ContactProvider>
                                    <NoteProvider>
                                        <WishProvider>
                                            <PrivateLayout>
                                                {children}
                                            </PrivateLayout>
                                        </WishProvider>
                                    </NoteProvider>
                                </ContactProvider>
                            </AnimalProvider>
                        </ObjectiveProvider>
                    </GroupProvider>
                </EventProvider>
            </UserProvider>
        </>
    );
}
