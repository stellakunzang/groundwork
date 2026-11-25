import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PipelineView from '@/src/components/pipeline/PipelineView';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

function company(overrides: {
  id: string;
  name: string;
  status?: string;
  ghosted?: boolean;
  outcome_notes?: string;
}) {
  return {
    role: null,
    status: 'applied',
    comp_range: null,
    stack: null,
    remote_policy: null,
    company_stage: null,
    source: null,
    careers_url: null,
    notes: null,
    outcome_notes: null,
    would_reapply: false,
    status_changed_at: '2026-11-01T00:00:00.000Z',
    created_at: '2026-11-01T00:00:00.000Z',
    updated_at: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PipelineView', () => {
  it('shows the empty state when nothing is tracked yet', () => {
    render(<PipelineView companies={[]} />);
    expect(screen.getByText(/Your story hasn't started yet/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open a New Chapter/ })).toHaveAttribute(
      'href',
      '/companies/new'
    );
  });

  it('files a quiet application under Ghosted and can show only that group', async () => {
    const user = userEvent.setup();
    render(
      <PipelineView
        companies={[
          company({ id: 'sweetums', name: 'Sweetums', status: 'applied', ghosted: true }),
          company({ id: 'gryzzl', name: 'Gryzzl', status: 'active' }),
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'Ghosted' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sweetums' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gryzzl' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ghosted (1)' }));

    expect(screen.getByRole('heading', { name: 'Sweetums' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Gryzzl' })).not.toBeInTheDocument();
  });

  it('puts offers in the spotlight instead of a plain column', () => {
    render(
      <PipelineView
        companies={[
          company({
            id: 'ron',
            name: 'Very Good Building Company',
            status: 'offer',
            outcome_notes: 'Offer is a handshake and a set of shop keys.',
          }),
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'You got the offer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Very Good Building Company' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Offer' })).not.toBeInTheDocument();
  });
});
