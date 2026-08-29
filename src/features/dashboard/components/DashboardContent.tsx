'use client';

import GridCards from "./GridCards";
import { WeatherCard } from '@/features/weather/components/WeatherCard';

export default function DashboardContent() {
        return (
                <div className="space-y-4 p-4">
                  <WeatherCard />
                  <GridCards />
                </div>
        );
}
