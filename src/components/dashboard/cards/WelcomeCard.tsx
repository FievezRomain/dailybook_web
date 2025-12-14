'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type Props = {
    height?: number;
};

type WeatherData = {
    temp: number;
    description: string;
    icon: string;
    city: string;
};

const WelcomeCard = ({ height = 4 }: Props) => {
    const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr });
    const formattedToday = today.charAt(0).toUpperCase() + today.slice(1);
    const { user, isLoading, isError } = useCurrentUser();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const rowHeightPx = 30;
    const computedMaxHeight = height * rowHeightPx;

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try{
                const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${apiKey}`
                );
                const data = await res.json();
                setWeather({
                    temp: data.main.temp,
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    city: data.name,
                });
            }catch(err){
                console.error("Erreur météo :", err);
                setError("Impossible de récupérer la météo." + err);
            }
        },
        (error) => {
            console.error("Erreur de géolocalisation :", error);
            setError("Impossible d'accéder à votre position.");
        });
    }, []);

    return (
        <Card className="h-full overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between gap-6 flex-col md:flex-row">
                {/* Texte de bienvenue */}
                    <div>
                        <h2 className="text-xl font-bold mb-2">Bienvenue {!isLoading && !isError && user && user.name} !</h2>
                        <p className="text-muted-foreground mb-4">{formattedToday}</p>
                    </div>

                    {/* Bloc météo */}
                    {error ? (
                        <p className="text-destructive">{error}</p>
                    ) : weather && (
                        <div className="flex items-center gap-4 md:pl-6 border-muted-foreground/30">
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                alt="icône météo"
                                className="w-16 h-16"
                            />
                            <div className="flex flex-col text-sm">
                                <span className="text-2xl font-bold">
                                    {Math.round(weather.temp)}°C
                                </span>
                                <span className="capitalize">{weather.description}</span>
                                <span className="text-muted-foreground">{weather.city}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default WelcomeCard;
