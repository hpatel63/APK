import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

interface StepProps {
  payload: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const steps = ['Guest Info', 'ID Upload', 'Rate & Stay', 'Payment', 'Signature', 'Confirmation'];

const ReservationModal = ({ payload, onSubmit, onClose }: StepProps) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    clientId: uuid(),
    propertyId: payload.propertyId,
    roomId: payload.room.id,
    roomNumber: payload.room.number,
    guest: { firstName: '', lastName: '', email: '', phone: '' },
    checkIn: payload.start,
    checkOut: dayjs(payload.start).add(1, 'day').toISOString(),
    totalAmount: 199,
    balance: 0,
    ratePlan: 'Best Flexible',
    channel: 'direct',
    payment: { method: 'cash', amount: 199 }
  });

  const next = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const prev = () => setStep((current) => Math.max(current - 1, 0));

  const complete = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <Dialog.Panel className="relative w-full max-w-2xl bg-aurora-glass backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6">
        <header>
          <Dialog.Title className="text-2xl font-semibold">Create Booking</Dialog.Title>
          <p className="text-white/60">{steps[step]}</p>
        </header>

        {step === 0 && (
          <section className="grid grid-cols-2 gap-4">
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="First Name"
              value={formData.guest.firstName}
              onChange={(event) => setFormData({ ...formData, guest: { ...formData.guest, firstName: event.target.value } })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Last Name"
              value={formData.guest.lastName}
              onChange={(event) => setFormData({ ...formData, guest: { ...formData.guest, lastName: event.target.value } })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Email"
              value={formData.guest.email}
              onChange={(event) => setFormData({ ...formData, guest: { ...formData.guest, email: event.target.value } })}
            />
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Phone"
              value={formData.guest.phone}
              onChange={(event) => setFormData({ ...formData, guest: { ...formData.guest, phone: event.target.value } })}
            />
          </section>
        )}

        {step === 2 && (
          <section className="grid grid-cols-2 gap-4">
            <label className="text-sm text-white/70">Check-In</label>
            <input
              type="datetime-local"
              value={dayjs(formData.checkIn).format('YYYY-MM-DDTHH:mm')}
              onChange={(event) => setFormData({ ...formData, checkIn: dayjs(event.target.value).toISOString() })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 col-span-2"
            />
            <label className="text-sm text-white/70">Check-Out</label>
            <input
              type="datetime-local"
              value={dayjs(formData.checkOut).format('YYYY-MM-DDTHH:mm')}
              onChange={(event) => setFormData({ ...formData, checkOut: dayjs(event.target.value).toISOString() })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 col-span-2"
            />
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div className="flex space-x-4">
              {['cash', 'card', 'cash_app', 'pending'].map((method) => (
                <button
                  key={method}
                  onClick={() => setFormData({ ...formData, payment: { ...formData.payment, method } })}
                  className={`px-4 py-2 rounded-lg border ${formData.payment.method === method ? 'border-aurora-neon text-aurora-neon' : 'border-white/10 text-white/60'}`}
                >
                  {method.toUpperCase()}
                </button>
              ))}
            </div>
            {formData.payment.method === 'card' && (
              <div className="grid grid-cols-2 gap-4">
                <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Card Number" />
                <input className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" placeholder="Expiry" />
              </div>
            )}
            {formData.payment.method === 'cash_app' && (
              <div className="p-4 rounded-xl bg-white/5 border border-aurora-neon/40 text-aurora-neon">
                Scan QR generated at payment.
              </div>
            )}
          </section>
        )}

        {step === 5 && (
          <div className="text-white/70 space-y-2">
            <p>Booking ready to confirm for {formData.guest.firstName || 'Guest'} in room {formData.roomNumber}.</p>
            <p>Check-in {dayjs(formData.checkIn).format('MMM D, h:mm A')}</p>
            <p>Total ${formData.totalAmount}</p>
          </div>
        )}

        <footer className="flex justify-between items-center">
          <button onClick={onClose} className="text-white/60 hover:text-white">Cancel</button>
          <div className="space-x-2">
            {step > 0 && (
              <button onClick={prev} className="px-4 py-2 rounded-lg border border-white/10 text-white/70">
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={next} className="px-4 py-2 rounded-lg bg-aurora-neon/20 border border-aurora-neon text-aurora-neon">
                Next
              </button>
            ) : (
              <button onClick={complete} className="px-4 py-2 rounded-lg bg-emerald-400/20 border border-emerald-400 text-emerald-200">
                Confirm
              </button>
            )}
          </div>
        </footer>
      </Dialog.Panel>
    </Dialog>
  );
};

export default ReservationModal;
