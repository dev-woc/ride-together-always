import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUploadThing } from '@/lib/uploadthing';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, ChevronLeft, Bike, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  full_name: z.string().min(2, 'Full name is required'),
  phone_number: z.string().min(10, 'Please enter a valid phone number'),
  instagram_handle: z.string().optional(),
  ride_group: z.enum(['cruising', 'exercise'], { required_error: 'Please select a ride group' }),
  yoga_signup: z.boolean(),
  lime_bike: z.boolean(),
  waiver_agreed: z.literal(true, { errorMap: () => ({ message: 'You must agree to the waiver to participate' }) }),
  bike_rental_waiver_agreed: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const bikeRentalWaiverText = `BICYCLE RENTAL AGREEMENT

Bike rentals are on a first come first serve basis and are subject to run out. You will receive a text message if we do not have any bikes available left to rent.

1. Condition of the Bike
Before riding, I will inspect the bicycle for any visible damages or issues and found none. If I do see damage I will let the provider know.

2. Liability for Damages
I agree to be fully responsible for any damage, loss, or theft of the rented bicycle during the rental period. I will be held liable for any repairs or replacements needed due to damage caused while the bicycle is in my possession, as assessed by the Provider or an approved repair facility.

Payment for Damages: In the event of damage to the rented bicycle, I agree to pay for any necessary repairs or the full replacement cost of the bicycle if the damage is deemed irreparable.

Payment Due: I understand that payment for any damage must be made within two (2) weeks of the incident.

3. Safe Use of the Bicycle
I agree to operate the bicycle in a safe and responsible manner at all times and to adhere to all traffic laws and safety guidelines. I understand that improper use of the bicycle may result in damage for which I will be held liable.

4. Assumption of Risk
I acknowledge that cycling involves inherent risks, including but not limited to injury or accidents caused by terrain, weather, other cyclists, vehicles, or mechanical failure. I voluntarily assume all risks associated with the use of the rented bicycle.

5. Indemnification
I agree to indemnify and hold harmless the Keep Pedaling Foundation and any associated parties from any claims, demands, or legal actions arising from my use of the rented bicycle, including injuries or damages to myself or others.

6. Legal Fees
In the event of legal action arising from damages, I agree to be responsible for any legal fees, court costs, and other related expenses incurred by the Provider to enforce this agreement or seek compensation for damages.

7. Acknowledgment and Agreement
By clicking "I agree" this serves as your signature to this waiver. I acknowledge that I have read, understood, and agree to the terms outlined above. I further agree to return the rented bicycle in good condition, or to be responsible for any damages, and to settle any costs for repairs or replacements within two (2) weeks of the incident.`;

const mainWaiverText = `Name of the Entity(s): Keep Pedaling Foundation, DBA Keep Pedaling Cycling Club, and its administrators, along with all other persons, firms, employees, guest teachers, corporations, associations, or partnerships.

ACCIDENT WAIVER AND RELEASE OF LIABILITY

I HEREBY ASSUME ALL OF THE RISKS OF PARTICIPATING AND/OR VOLUNTEERING IN THIS ACTIVITY OR EVENT, including, but not limited to, any risks that may arise from negligence or carelessness on the part of the persons or entities being released from dangerous or defective equipment or property owned, maintained, or controlled by them, or because of their possible liability without fault.

I certify that I am physically fit, have sufficiently prepared or trained for participation in the activity or event, and have not been ADVISED against participating by a qualified medical professional. I certify that there are no health-related reasons or problems that preclude my participation in this activity or event.

I acknowledge that this Accident Waiver and Release of Liability will be used by the holders, sponsors, and organizers of the activity or event in which I may participate, and it will govern my actions and responsibilities at said activity or event.

I WAIVE, RELEASE, AND DISCHARGE the Keep Pedaling Foundation, DBA Keep Pedaling Cycling Club, and all entities or persons involved from any and all liability, including but not limited to liability arising from negligence or fault, for my death, disability, personal injury, property damage, property theft, or actions of any kind that may occur to me, including my travel to and from this event.

I INDEMNIFY, HOLD HARMLESS, AND PROMISE NOT TO SUE the entities or persons mentioned in this paragraph from any and all liabilities or claims made as a result of my participation in this activity or event, whether caused by negligence or otherwise.

I acknowledge that the Keep Pedaling Foundation and its DBA Keep Pedaling Cycling Club are NOT responsible for errors, omissions, acts, or failures to act of any party or entity conducting a specific event or activity. I also acknowledge that this event may involve testing my physical and mental limits and may carry the potential for death, serious injury, and property loss. The risks include but are not limited to those caused by terrain, facilities, weather, condition of participants, equipment, vehicular traffic, and actions of others.

HELMET RECOMMENDATION AND LIABILITY DISCLAIMER

I understand that the Keep Pedaling Foundation and Keep Pedaling Cycling Club highly recommend that all participants wear helmets while cycling for their safety. I acknowledge that if I choose not to wear a helmet, I do so at my own risk, and I release the Keep Pedaling Foundation and Keep Pedaling Cycling Club from any responsibility for injuries or damages resulting from not wearing a helmet. I agree that I alone assume all liability for any injury that may occur because of not wearing a helmet.

I consent to receive medical treatment deemed advisable in the event of injury, accident, and/or illness during this activity or event.

I understand that at this event or related activities, I may be photographed or recorded on video. I agree to allow my photo, video, or film likeness to be used for any legitimate purpose by the Keep Pedaling Foundation, DBA Keep Pedaling Cycling Club, its event holders, producers, sponsors, organizers, and assigns.

COVID-19 ACKNOWLEDGMENT

Considering the ongoing COVID-19 pandemic, I agree to the following: I affirm that I, as well as all household members, do not currently, nor have experienced COVID-19 symptoms (fever, fatigue, dry cough, difficulty breathing) within the last 14 days. I affirm that I, as well as all household members, have not been diagnosed with COVID-19 within the past 30 days. I affirm that I, as well as all household members, have not knowingly been exposed to anyone diagnosed with COVID-19 within the past 30 days. I affirm that I, as well as all household members, have not traveled outside of the country or to any city considered a "hot spot" for COVID-19 infections within the past 30 days.

I CERTIFY THAT I HAVE READ AND FULLY UNDERSTAND THE CONTENTS OF THIS DOCUMENT. I AM AWARE THAT THIS IS A RELEASE OF LIABILITY AND A BINDING CONTRACT, AND I AM SIGNING IT OF MY OWN FREE WILL.`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RideSignup() {
  const [searchParams] = useSearchParams();
  const eventName = searchParams.get('event') || 'Bike N Thrive';
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [licenseError, setLicenseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing('driverLicense', {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) setLicenseUrl(res[0].url);
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      yoga_signup: false,
      lime_bike: false,
      waiver_agreed: undefined,
      bike_rental_waiver_agreed: false,
    },
  });

  const rideGroup = watch('ride_group');
  const yogaSignup = watch('yoga_signup');
  const limeBike = watch('lime_bike');
  const waiverAgreed = watch('waiver_agreed');
  const bikeRentalWaiverAgreed = watch('bike_rental_waiver_agreed');

  // Steps change dynamically based on whether user wants a Lime bike
  const stepLabels = limeBike
    ? ['Your Info', 'Ride Preferences', 'Bike Rental', 'Waiver & Confirm']
    : ['Your Info', 'Ride Preferences', 'Waiver & Confirm'];

  const totalSteps = stepLabels.length;
  const waiverStep = limeBike ? 3 : 2;

  const stepFieldMap: Record<number, (keyof FormData)[]> = {
    0: ['email', 'full_name', 'phone_number'],
    1: ['ride_group', 'yoga_signup', 'lime_bike'],
    2: limeBike ? [] : ['waiver_agreed'], // bike rental step has no RHF fields (file + manual checkbox)
    3: ['waiver_agreed'],
  };

  const handleNext = async () => {
    const fields = stepFieldMap[step] ?? [];
    const valid = fields.length ? await trigger(fields) : true;

    // Validate bike rental step manually
    if (limeBike && step === 2) {
      let ok = true;
      if (!licenseFile && !licenseUrl) {
        setLicenseError('Please upload a photo of your driver\'s license');
        ok = false;
      }
      if (!bikeRentalWaiverAgreed) {
        ok = false;
        toast.error('You must agree to the bike rental waiver');
      }
      if (!ok) return;
      setLicenseError('');
      // upload license before moving to next step
      if (licenseFile && !licenseUrl) {
        const uploaded = await startUpload([licenseFile]);
        if (!uploaded?.[0]?.url) {
          setLicenseError('Upload failed, please try again');
          return;
        }
      }
    }

    if (valid) setStep((s) => s + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setLicenseError('File must be under 10 MB');
      return;
    }
    setLicenseFile(file);
    setLicenseError('');
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/ride-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, driver_license_data: licenseUrl, event_name: eventName }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-24 pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">YOU'RE IN!</h1>
            <p className="text-muted-foreground text-lg mb-2">
              We'll see you Saturday, March 28 at 8:00AM.
            </p>
            <p className="text-muted-foreground mb-8">
              RTW Photography Studio<br />
              520 N Parramore Ave, Orlando FL 32801<br />
              <span className="text-primary font-medium">Check-in & massages begin 8:00AM · Ride out 8:45AM</span>
            </p>
            <p className="text-sm text-muted-foreground">
              We'll contact you if there are any weather-related changes. Let's pedal, refresh, and thrive together!
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Bike className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
              BIKE N THRIVE
            </h1>
            <p className="text-muted-foreground">Saturday, March 28 · 8:00AM · Orlando, FL</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-10 gap-2">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i < step
                        ? 'bg-primary text-primary-foreground'
                        : i === step
                        ? 'bg-primary/20 border-2 border-primary text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-8 h-0.5 mb-4 transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">

                {/* Step 0: Personal Info */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1">YOUR INFO</h2>
                    <p className="text-muted-foreground text-sm mb-6">Space is limited — RSVP to save your spot.</p>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email <span className="text-primary">*</span></Label>
                      <Input id="email" type="email" placeholder="your@email.com" className="bg-muted border-border" {...register('email')} />
                      {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-foreground">Full Name <span className="text-primary">*</span></Label>
                      <Input id="full_name" placeholder="Jane Smith" className="bg-muted border-border" {...register('full_name')} />
                      {errors.full_name && <p className="text-destructive text-xs">{errors.full_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number" className="text-foreground">Phone Number <span className="text-primary">*</span></Label>
                      <Input id="phone_number" type="tel" placeholder="(407) 555-0100" className="bg-muted border-border" {...register('phone_number')} />
                      {errors.phone_number && <p className="text-destructive text-xs">{errors.phone_number.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram_handle" className="text-foreground">
                        Instagram Handle
                        <span className="text-muted-foreground ml-1 text-xs">(optional — we'll add you to the group chat)</span>
                      </Label>
                      <Input id="instagram_handle" placeholder="@yourhandle" className="bg-muted border-border" {...register('instagram_handle')} />
                    </div>
                  </motion.div>
                )}

                {/* Step 1: Ride Preferences */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1">RIDE PREFERENCES</h2>
                    <p className="text-muted-foreground text-sm mb-6">Help us plan the perfect ride for you.</p>

                    <div className="space-y-3">
                      <Label className="text-foreground">Select your ride group <span className="text-primary">*</span></Label>
                      <div className="grid gap-3">
                        {[
                          { value: 'cruising', label: 'Cruising', desc: 'Slower pace, shorter distance — very light exercise, very social' },
                          { value: 'exercise', label: 'Exercise', desc: 'Higher speeds, longer distance — more of a pump' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setValue('ride_group', option.value as 'cruising' | 'exercise', { shouldValidate: true })}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                              rideGroup === option.value ? 'border-primary bg-primary/10' : 'border-border bg-muted hover:border-muted-foreground'
                            }`}
                          >
                            <div className="font-display font-bold text-foreground">{option.label}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                      {errors.ride_group && <p className="text-destructive text-xs">{errors.ride_group.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground">
                        Optional post-ride yoga with Tammy Yoga? <span className="text-primary">*</span>
                        <span className="block text-muted-foreground text-xs font-normal mt-0.5">$15 — we'll send you a payment link</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[{ value: true, label: "Yes, I'm in!" }, { value: false, label: 'No thanks' }].map((option) => (
                          <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => setValue('yoga_signup', option.value, { shouldValidate: true })}
                            className={`p-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                              yogaSignup === option.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted text-muted-foreground hover:border-muted-foreground'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-foreground">
                        Want a free Lime bike from our sponsor? <span className="text-primary">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[{ value: true, label: 'Yes please!' }, { value: false, label: 'No, I have my own' }].map((option) => (
                          <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => setValue('lime_bike', option.value, { shouldValidate: true })}
                            className={`p-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                              limeBike === option.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-muted text-muted-foreground hover:border-muted-foreground'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {limeBike && (
                        <p className="text-xs text-primary/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                          You'll need to upload your driver's license and agree to the rental waiver on the next step.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Bike Rental (only shown when lime_bike = true) */}
                {step === 2 && limeBike && (
                  <motion.div
                    key="step2-bike"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1">BIKE RENTAL</h2>
                    <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg px-3 py-2">
                      Bikes are first come first serve and subject to availability. We'll text you if none are left.
                    </div>

                    {/* Driver's license upload */}
                    <div className="space-y-2">
                      <Label className="text-foreground">
                        Driver's License <span className="text-primary">*</span>
                        <span className="block text-muted-foreground text-xs font-normal mt-0.5">Upload a photo. Max 10 MB.</span>
                      </Label>

                      {licenseFile ? (
                        <div className="flex items-center justify-between bg-muted border border-primary/30 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground truncate">{licenseFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setLicenseFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="ml-2 text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg py-8 px-4 bg-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload your driver's license</span>
                          <span className="text-xs text-muted-foreground">JPG, PNG, PDF — max 10 MB</span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {licenseError && <p className="text-destructive text-xs">{licenseError}</p>}
                    </div>

                    {/* Rental waiver */}
                    <div className="space-y-3">
                      <Label className="text-foreground">Rental Agreement <span className="text-primary">*</span></Label>
                      <div className="bg-muted rounded-lg p-4 h-56 overflow-y-auto text-xs text-muted-foreground leading-relaxed whitespace-pre-line border border-border">
                        {bikeRentalWaiverText}
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue('bike_rental_waiver_agreed', !bikeRentalWaiverAgreed)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          bikeRentalWaiverAgreed ? 'border-primary bg-primary/10' : 'border-border bg-muted hover:border-muted-foreground'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                          bikeRentalWaiverAgreed ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}>
                          {bikeRentalWaiverAgreed && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-foreground font-medium">
                          I Agree — this serves as my digital signature
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Final step: Main Waiver */}
                {step === waiverStep && (
                  <motion.div
                    key="step-waiver"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <h2 className="font-display text-2xl font-bold text-foreground mb-1">LIABILITY WAIVER</h2>
                    <p className="text-muted-foreground text-sm">Please read and agree to participate.</p>

                    <div className="bg-muted rounded-lg p-4 h-64 overflow-y-auto text-xs text-muted-foreground leading-relaxed whitespace-pre-line border border-border">
                      {mainWaiverText}
                    </div>

                    <button
                      type="button"
                      onClick={() => setValue('waiver_agreed', waiverAgreed ? undefined as unknown as true : true, { shouldValidate: true })}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        waiverAgreed ? 'border-primary bg-primary/10' : 'border-border bg-muted hover:border-muted-foreground'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                        waiverAgreed ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}>
                        {waiverAgreed && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className="text-sm text-foreground font-medium">
                        I Agree — this serves as my digital signature
                      </span>
                    </button>
                    {errors.waiver_agreed && <p className="text-destructive text-xs">{errors.waiver_agreed.message}</p>}

                    <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border">
                      <p className="font-medium text-foreground mb-1">Meeting Location</p>
                      <p>RTW Photography Studio</p>
                      <p>520 N Parramore Ave, Orlando FL 32801</p>
                      <p className="text-primary mt-1">Check-in & massages begin 8:00AM · Ride out 8:45AM</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                {step > 0 ? (
                  <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                ) : <div />}

                {step < totalSteps - 1 ? (
                  <Button type="button" onClick={handleNext} disabled={isUploading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold">
                    {isUploading ? 'Uploading...' : 'Next'}
                    {!isUploading && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                ) : (
                  <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold">
                    {submitting ? 'Submitting...' : "RSVP — LET'S RIDE"}
                  </Button>
                )}
              </div>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Questions? DM us on Instagram or email{' '}
            <a href="mailto:wayofcode321@gmail.com" className="text-primary hover:underline">wayofcode321@gmail.com</a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
