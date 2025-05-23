'use client';

type Props = {
  email: string;
};

export default function DashboardContent({ email }: Props) {
  return (
    <div>
      <h1>Bienvenue {email} 👋</h1>
    </div>
  );
}
