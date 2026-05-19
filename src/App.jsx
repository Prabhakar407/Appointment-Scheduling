import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  Stethoscope,
  Smile,
  Hand,
  Brain,
  Dog,
  Accessibility,
  Leaf,
  Sparkles,
  ArrowLeft,
  Calendar,
  Clock,
  Send,
  CreditCard,
  WalletCards,
  ShieldCheck,
  Lock,
  MapPin,
  Ticket,
  ShoppingBag,
  BadgeCheck,
  Trophy,
  Package,
} from "lucide-react";

const doctorImage = "/images/image_19-cutout.png";
const chatbotImage = "/images/chatbot.png";

const indianClients = [
  { name: "Arjun Sharma", img: "https://i.pravatar.cc/150?u=arjun" },
  { name: "Priya Patel", img: "https://i.pravatar.cc/150?u=priya" },
  { name: "Ishaan Iyer", img: "https://i.pravatar.cc/150?u=ishaan" },
];

const availableSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "04:30 PM",
  "06:30 PM",
];

const SESSION_PRICE = 1000;

const getCurrentTime = () =>
  new Date()
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

const isAffirmative = (text) =>
  /^(yes|yeah|yep|sure|ok|okay|confirm|book it|go ahead|done|y)$/i.test(
    text.trim()
  );

const isNegative = (text) =>
  /^(no|nope|cancel|not now|maybe later|n)$/i.test(text.trim());

const wantsAppointment = (text) =>
  /(book|booking|appointment|slot|schedule|reserve|available|time|doctor|session)/i.test(
    text
  );

const parseDayFromMessage = (text) => {
  const match =
    text.match(/(?:nov|november)\s*(\d{1,2})/i) ||
    text.match(/\b(?:on|for|date|day)\s*(\d{1,2})\b/i);

  if (!match) return null;

  const day = Number(match[1]);
  return day >= 1 && day <= 30 ? day : null;
};

const normalizeTime = (rawHour, rawMinute, rawPeriod) => {
  let hour = Number(rawHour);
  const minute = rawMinute ? rawMinute.padStart(2, "0") : "00";
  let period = rawPeriod?.toUpperCase();

  if (!period) {
    period = hour >= 12 ? "PM" : "AM";
  }

  if (hour > 12) {
    hour = hour - 12;
    period = "PM";
  }

  const paddedHour = String(hour).padStart(2, "0");
  return `${paddedHour}:${minute} ${period}`;
};

const parseTimeFromMessage = (text) => {
  const matches = [...text.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/gi)];

  for (const match of matches) {
    const time = normalizeTime(match[1], match[2], match[3]);
    const exactSlot = availableSlots.find((slot) => slot === time);

    if (exactSlot) return exactSlot;
  }

  return null;
};

function PaymentMethodLogo({ name }) {
  if (name === "Debit Card") {
    return (
      <div className="relative h-8 w-12 overflow-hidden rounded-md bg-gradient-to-br from-[#1F2937] to-[#111827] shadow-sm">
        <div className="absolute left-2 top-2 h-2.5 w-3 rounded-sm bg-[#D6A84F]" />
        <div className="absolute bottom-2 left-2 h-1 w-7 rounded-full bg-white/70" />
        <div className="absolute bottom-4 left-2 h-1 w-5 rounded-full bg-white/40" />
      </div>
    );
  }

  if (name === "Credit Card") {
    return (
      <div className="relative h-8 w-12 overflow-hidden rounded-md bg-gradient-to-br from-[#E5E7EB] to-[#9CA3AF] shadow-sm">
        <div className="absolute left-0 top-2 h-2 w-full bg-[#374151]" />
        <div className="absolute bottom-2 left-2 h-1 w-7 rounded-full bg-white/80" />
        <div className="absolute bottom-4 left-2 h-1 w-5 rounded-full bg-white/60" />
      </div>
    );
  }

  if (name === "PhonePe") {
    return (
      <div className="grid h-8 w-8 place-items-center rounded-full bg-[#5F259F] text-lg font-black text-white">
        पे
      </div>
    );
  }

  if (name === "Google Pay") {
    return (
      <div className="flex items-center gap-1 text-xl font-black">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">P</span>
        <span className="text-[#FBBC05]">a</span>
        <span className="text-[#34A853]">y</span>
      </div>
    );
  }

  return (
    <div className="text-lg font-black">
      <span className="text-[#002970]">Pay</span>
      <span className="text-[#00BAF2]">tm</span>
    </div>
  );
}

function PaymentPage({ bookingDetails, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState("Debit Card");
  const [activePopup, setActivePopup] = useState(null);
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const paymentMethods = [
    { name: "Debit Card" },
    { name: "Credit Card" },
    { name: "PhonePe" },
    { name: "Google Pay" },
    { name: "Paytm" },
  ];

  const selectedDay = bookingDetails?.day || 12;
  const selectedTime = bookingDetails?.time || "10:00 AM";
  const selectedProfession = bookingDetails?.profession || "Appointment";
  const client = bookingDetails?.client || indianClients[1];

  const handlePayment = async () => {
    if (!isPaymentReady) return;

    const popups = [
      { type: "email", text: "Confirmation sent to Email" },
      { type: "sms", text: "Confirmation sent to SMS" },
      { type: "whatsapp", text: "Confirmation sent to WhatsApp" },
    ];

    for (const popup of popups) {
      setActivePopup(popup);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setActivePopup(null);
      await new Promise((resolve) => setTimeout(resolve, 450));
    }
  };

  const isPaymentReady =
    cardholderName.trim() &&
    cardNumber.trim() &&
    expiryDate.trim() &&
    cvv.trim();

  return (
    <div className="min-h-screen bg-[#F2EBE3] px-4 py-4 font-sans text-[#1A1A1A]">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.05fr_0.72fr]">
          <section className="rounded-[20px] border border-[#63242B]/10 bg-white p-3.5 shadow-xl md:p-4">
            <div className="mb-2.5 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#63242B] text-white">
                <WalletCards size={17} />
              </div>

              <div>
                <h2 className="text-lg font-black text-[#1A1A1A]">
                  Complete Your Payment
                </h2>
                <p className="mt-0.5 text-[10px] font-medium text-[#6B635E]">
                  Secure payment for your appointment
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-1.5 text-[11px] font-black text-[#1A1A1A]">
                Choose Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {paymentMethods.map((method) => (
                  <button
                    key={method.name}
                    onClick={() => setSelectedMethod(method.name)}
                    className={`relative flex h-13 flex-col items-center justify-center gap-1 rounded-lg border bg-white px-1 text-[8px] font-bold transition ${
                      selectedMethod === method.name
                        ? "border-[#63242B] text-[#63242B] shadow-sm"
                        : "border-[#E2DAD2] text-[#6B635E] hover:border-[#63242B]/40"
                    }`}
                  >
                    <PaymentMethodLogo name={method.name} />
                    <span>{method.name}</span>

                    <span
                      className={`absolute bottom-[-7px] h-3.5 w-3.5 rounded-full border bg-white ${
                        selectedMethod === method.name
                          ? "border-[#63242B]"
                          : "border-[#CFC7BE]"
                      }`}
                    >
                      {selectedMethod === method.name && (
                        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#63242B]" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1.5 h-px bg-[#E5DDD5]" />

            <div>
              <h3 className="mb-1 text-[11px] font-black text-[#1A1A1A]">
                Pay with Card
              </h3>

              <div className="space-y-1.5">
                <div>
                  <label className="mb-0.5 block text-[9px] font-bold text-[#3A3633]">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    placeholder="Enter cardholder name"
                    className="w-full rounded-lg border border-[#D8D0C8] bg-white px-2.5 py-1.5 text-[11px] outline-none transition placeholder:text-[#AAA09A] focus:border-[#63242B] focus:ring-2 focus:ring-[#63242B]/10"
                  />
                </div>

                <div>
                  <label className="mb-0.5 block text-[9px] font-bold text-[#3A3633]">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-lg border border-[#D8D0C8] bg-white px-2.5 py-1.5 pr-9 text-[11px] outline-none transition placeholder:text-[#AAA09A] focus:border-[#63242B] focus:ring-2 focus:ring-[#63242B]/10"
                    />
                    <CreditCard
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8580]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <label className="mb-0.5 block text-[9px] font-bold text-[#3A3633]">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(event) => setExpiryDate(event.target.value)}
                      placeholder="MM / YY"
                      className="w-full rounded-lg border border-[#D8D0C8] bg-white px-2.5 py-1.5 text-[11px] outline-none transition placeholder:text-[#AAA09A] focus:border-[#63242B] focus:ring-2 focus:ring-[#63242B]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-0.5 block text-[9px] font-bold text-[#3A3633]">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(event) => setCvv(event.target.value)}
                      placeholder="123"
                      className="w-full rounded-lg border border-[#D8D0C8] bg-white px-2.5 py-1.5 text-[11px] outline-none transition placeholder:text-[#AAA09A] focus:border-[#63242B] focus:ring-2 focus:ring-[#63242B]/10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[#F8F2EB] px-2.5 py-1.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#6B635E]">
                    <Lock size={12} />
                    256-bit secure payment
                  </div>

                  <span className="rounded bg-white px-2 py-1 text-[9px] font-black text-[#1F8A70]">
                    PCI DSS
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!isPaymentReady}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-[11px] font-black shadow-lg transition ${
                    isPaymentReady
                      ? "bg-[#63242B] text-white hover:brightness-110 active:scale-95"
                      : "cursor-not-allowed bg-[#B9B2AC] text-white"
                  }`}
                >
                  Pay Now ₹{SESSION_PRICE}
                  <Lock size={12} />
                </button>

                <p className="flex items-center justify-center gap-1.5 pt-0.5 text-[9px] font-medium text-[#6B635E]">
                  <ShieldCheck size={11} />
                  Your payment details are encrypted and secure.
                </p>
              </div>
            </div>
          </section>

          <aside className="relative space-y-5">
            <AnimatePresence>
              {activePopup && (
                <motion.div
                  key={activePopup.text}
                  initial={{ opacity: 0, x: 140 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 140 }}
                  transition={{
                    duration: 0.45,
                    ease: "easeOut",
                  }}
                  className="absolute right-0 top-0 z-30 w-full max-w-[390px] rounded-2xl border border-[#E5DDD5] bg-white px-5 py-4 shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-500 text-white shadow-md">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#1A1A1A]">
                        Your booking is successful
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-[#6B635E]">
                        {activePopup.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <section className="rounded-[20px] border border-[#63242B]/10 bg-white p-3.5 shadow-xl">
              <h3 className="mb-2 text-sm font-black text-[#1A1A1A]">
                Appointment Summary
              </h3>

              <div className="flex items-center gap-2.5">
                <img
                  src={client.img}
                  alt={client.name}
                  className="h-11 w-11 rounded-full border-4 border-[#F8F2EB] object-cover shadow-sm"
                />

                <div>
                  <h4 className="text-[13px] font-black text-[#1A1A1A]">
                    {client.name}
                  </h4>
                  <p className="mt-0.5 text-[10px] font-bold text-[#6B635E]">
                    {selectedProfession}
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium text-[#8A817A]">
                    MediBook Pro Appointment
                  </p>
                </div>
              </div>

              <div className="my-2 h-px bg-[#E5DDD5]" />

              <div className="space-y-2">
                <div className="grid grid-cols-[16px_1fr_1.2fr] items-start gap-2">
                  <Calendar size={12} className="text-[#63242B]" />
                  <p className="text-[10px] font-bold text-[#6B635E]">Date</p>
                  <p className="text-[10px] font-black text-[#1A1A1A]">
                    Nov {selectedDay}, 2026
                  </p>
                </div>

                <div className="grid grid-cols-[16px_1fr_1.2fr] items-start gap-2">
                  <Clock size={12} className="text-[#63242B]" />
                  <p className="text-[10px] font-bold text-[#6B635E]">Time</p>
                  <p className="text-[10px] font-black text-[#1A1A1A]">
                    {selectedTime}
                  </p>
                </div>

                <div className="grid grid-cols-[16px_1fr_1.2fr] items-start gap-2">
                  <MapPin size={12} className="text-[#63242B]" />
                  <p className="text-[10px] font-bold text-[#6B635E]">Clinic</p>
                  <p className="text-[10px] font-black text-[#1A1A1A]">
                    MediBook Wellness Clinic
                    <span className="block text-[9px] font-medium text-[#8A817A]">
                      Bengaluru, Karnataka
                    </span>
                  </p>
                </div>
              </div>

              <div className="my-2 h-px bg-[#E5DDD5]" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#6B635E]">Session Fee</span>
                  <span className="font-black text-[#1A1A1A]">
                    ₹{SESSION_PRICE}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#6B635E]">
                    Taxes & Charges
                  </span>
                  <span className="font-black text-[#1A1A1A]">₹0</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[#F8F2EB] px-2.5 py-1.5">
                  <span className="text-[11px] font-black text-[#1A1A1A]">
                    Total Amount
                  </span>
                  <span className="text-base font-black text-[#63242B]">
                    ₹{SESSION_PRICE}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[20px] border border-[#63242B]/10 bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#63242B] text-white">
                  <ShieldCheck size={26} />
                </div>

                <div>
                  <h3 className="text-sm font-black text-[#1A1A1A]">
                    Safe & Secure Payments
                  </h3>
                  <p className="mt-1 text-[10px] font-medium leading-relaxed text-[#6B635E]">
                    We use industry-standard encryption to protect your payment
                    information.
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["PCI DSS", "Verified by Visa", "Mastercard SecureCode"].map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-full bg-[#F8F2EB] px-2 py-1 text-[8px] font-black text-[#63242B]"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-[#63242B] transition hover:opacity-70"
          >
            <ArrowLeft size={18} /> Back to Booking
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingPage({ selectedProfession, onBack, onProceedToPayment }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showSlots, setShowSlots] = useState(false);

  const [chatSelectedDay, setChatSelectedDay] = useState(null);
  const [chatSelectedTime, setChatSelectedTime] = useState(null);
  const [bookingStage, setBookingStage] = useState("idle");
  const [showBookSlotButton, setShowBookSlotButton] = useState(false);

  const [client] = useState(
    () => indianClients[Math.floor(Math.random() * indianClients.length)]
  );

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: `Hi! I’m your booking assistant. You can select a date from the calendar above, or ask me to book an appointment. For example: "Book an appointment on Nov 12 at 10 AM".`,
      time: "09:41 pm",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    const chatBox = chatScrollRef.current;
    if (!chatBox) return;

    chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages, isTyping, showBookSlotButton]);

  const goToPayment = (source = "calendar") => {
    const finalDay = source === "chatbot" ? chatSelectedDay : selectedDay;
    const finalTime = source === "chatbot" ? chatSelectedTime : selectedTime;

    if (!finalDay || !finalTime) return;

    onProceedToPayment({
      day: finalDay,
      time: finalTime,
      profession: selectedProfession?.name || "Appointment",
      client,
    });
  };

  const handleDateSelect = (day) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setShowSlots(true);
    setShowBookSlotButton(false);
    setBookingStage("idle");
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
    setShowBookSlotButton(false);
    setBookingStage("idle");
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
        time: getCurrentTime(),
      },
    ]);

    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const parsedDay = parseDayFromMessage(userMessage);
      const parsedTime = parseTimeFromMessage(userMessage);

      let nextDay = chatSelectedDay;
      let nextTime = chatSelectedTime;
      let botReply = "";

      if (parsedDay) {
        nextDay = parsedDay;
        setChatSelectedDay(parsedDay);
      }

      if (parsedTime) {
        nextTime = parsedTime;
        setChatSelectedTime(parsedTime);
      }

      if (bookingStage === "awaitingConfirmation" && isNegative(userMessage)) {
        botReply =
          "No problem. You can tell me another preferred date and time.";
        setBookingStage("idle");
        setShowBookSlotButton(false);
      } else if (parsedDay && parsedTime) {
        botReply = `The session price is 1000 rs. I found your preferred slot: Nov ${parsedDay} at ${parsedTime}. Click the Book Slot button below to continue to payment.`;
        setBookingStage("awaitingConfirmation");
        setShowBookSlotButton(true);
      } else if (parsedDay && !parsedTime) {
        botReply = `You selected Nov ${parsedDay}. Available slots are ${availableSlots.join(
          ", "
        )}. Please tell me which time you want.`;
        setBookingStage("choosingTime");
        setShowBookSlotButton(false);
      } else if (!parsedDay && parsedTime) {
        if (nextDay) {
          botReply = `You selected ${parsedTime} for Nov ${nextDay}. Click the Book Slot button below to continue to payment.`;
          setBookingStage("awaitingConfirmation");
          setShowBookSlotButton(true);
        } else {
          botReply = `I can book ${parsedTime}. Please tell me the date too, such as "Nov 12".`;
          setBookingStage("choosingDate");
          setShowBookSlotButton(false);
        }
      } else if (isAffirmative(userMessage) && nextDay && nextTime) {
        botReply = `Your appointment is ready for Nov ${nextDay} at ${nextTime}. Click the Book Slot button below to continue to payment.`;
        setBookingStage("awaitingConfirmation");
        setShowBookSlotButton(true);
      } else if (wantsAppointment(userMessage)) {
        if (!nextDay && !nextTime) {
          botReply = `Sure. The session price is 1000 rs. Please tell me your preferred date and time, such as "Nov 12 at 10 AM".`;
          setBookingStage("choosingDate");
          setShowBookSlotButton(false);
        } else if (nextDay && !nextTime) {
          botReply = `You selected Nov ${nextDay}. Available slots are ${availableSlots.join(
            ", "
          )}. Which time would you like?`;
          setBookingStage("choosingTime");
          setShowBookSlotButton(false);
        } else if (!nextDay && nextTime) {
          botReply = `I have the time ${nextTime}. Please tell me the date too.`;
          setBookingStage("choosingDate");
          setShowBookSlotButton(false);
        } else {
          botReply = `The session price is 1000 rs. Your appointment is ready for Nov ${nextDay} at ${nextTime}. Click the Book Slot button below to continue to payment.`;
          setBookingStage("awaitingConfirmation");
          setShowBookSlotButton(true);
        }
      } else {
        botReply = `I can help you book an appointment. Please tell me a date and time, for example: "Book Nov 12 at 10 AM".`;
        setShowBookSlotButton(false);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: botReply,
          time: getCurrentTime(),
        },
      ]);

      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="min-h-[calc(100vh-5.75rem)] overflow-y-auto bg-[#F2EBE3] px-4 pb-3 pt-2 font-sans text-[#1A1A1A]">
      <div className="mx-auto flex min-h-full max-w-4xl flex-col">
        <section className="text-center">
          <h2 className="text-3xl font-black text-[#63242B] md:text-4xl">
            Book Your Appointment
          </h2>

          <p className="mx-auto mt-1.5 max-w-xl text-sm font-medium text-[#6B635E]">
            Choose a date and time that works for you. The session price is 1000
            rs.
          </p>
        </section>

        <div className="flex items-center justify-start pt-1 md:-ml-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-[#63242B] transition hover:opacity-70"
          >
            <ArrowLeft size={18} /> Back to Use Cases
          </button>
        </div>

        <div className="mx-auto mt-2 grid w-full max-w-4xl flex-1 gap-3 lg:grid-cols-[0.68fr_0.65fr] lg:justify-center">
          <section className="overflow-hidden rounded-[24px] border border-[#63242B]/10 bg-white shadow-xl">
            <div className="grid h-full grid-cols-[0.78fr_1.22fr]">
              <div className="border-r border-[#63242B]/10 bg-[#F8F2EB] p-3">
                <div className="mb-2.5 h-20 overflow-hidden rounded-2xl bg-[#63242B]/10">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80"
                    alt="Professional"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <img
                    src={client.img}
                    alt={client.name}
                    className="h-9 w-9 rounded-full border-4 border-white shadow-md"
                  />

                  <div>
                    <h3 className="text-sm font-black text-[#1A1A1A]">
                      {selectedProfession?.name || "Medical Booking"}
                    </h3>

                    <div className="mt-1 flex w-fit items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#63242B]">
                      <Clock size={10} />
                      30 mins
                    </div>
                  </div>
                </div>

                <p className="mt-2.5 text-[10px] font-medium leading-relaxed text-[#6B635E]">
                  Welcome to MediBook Pro. Choose a convenient date and time for
                  your{" "}
                  {selectedProfession?.name?.toLowerCase() || "appointment"}.
                </p>

                <div className="mt-2.5 rounded-xl bg-white p-2.5">
                  <p className="text-[9px] font-black uppercase text-[#63242B]">
                    Selected Slot
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-[#1A1A1A]">
                    {selectedDay ? `Nov ${selectedDay}` : "Select a date"}
                    {selectedTime ? `, ${selectedTime}` : ""}
                  </p>
                </div>
              </div>

              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <button className="rounded-full border border-[#63242B]/10 px-2.5 py-1 text-[9px] font-black text-[#63242B]">
                    Today
                  </button>

                  <div className="text-center">
                    <p className="text-[11px] font-black text-[#1A1A1A]">
                      November 2026
                    </p>
                    <p className="text-[9px] font-bold text-[#6B635E]">
                      Select a date
                    </p>
                  </div>

                  <Calendar size={14} className="text-[#63242B]" />
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[8px] font-black text-[#6B635E]">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day) => (
                      <div key={day}>{day}</div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 30 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(index + 1)}
                      className={`h-5.5 rounded-full text-[9px] font-black transition-all ${
                        selectedDay === index + 1
                          ? "bg-[#63242B] text-white shadow-md"
                          : "bg-[#F8F2EB] text-[#1A1A1A] hover:bg-[#63242B]/10"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showSlots && selectedDay && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 border-t border-[#63242B]/10 pt-2">
                        <div className="mb-1.5">
                          <p className="text-[11px] font-black text-[#1A1A1A]">
                            November {selectedDay}
                          </p>
                          <p className="text-[9px] font-bold text-[#6B635E]">
                            Available time slots
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                          {availableSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => handleTimeSelect(slot)}
                              className={`rounded-full border px-2.5 py-1.5 text-[9px] font-black transition-all ${
                                selectedTime === slot
                                  ? "border-[#701D2A] bg-[#701D2A] text-white"
                                  : "border-[#F5F0E7] bg-white text-[#1A1A1A] hover:border-[#701D2A] hover:bg-[#701D2A] hover:text-white"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>

                        <div className="mt-2 flex flex-col gap-1.5 rounded-xl bg-[#F8F2EB] p-2.5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase text-[#63242B]">
                              Appointment Summary
                            </p>
                            <p className="text-[11px] font-bold text-[#1A1A1A]">
                              {selectedDay
                                ? `Nov ${selectedDay}`
                                : "Select a date"}{" "}
                              {selectedTime ? `at ${selectedTime}` : ""}
                            </p>
                          </div>

                          <button
                            onClick={() => goToPayment("calendar")}
                            disabled={!selectedDay || !selectedTime}
                            className={`rounded-full px-4 py-2 text-[9px] font-black shadow-lg transition ${
                              selectedDay && selectedTime
                                ? "bg-[#63242B] text-white hover:brightness-110 active:scale-95"
                                : "cursor-not-allowed bg-[#63242B]/30 text-white"
                            }`}
                          >
                            Confirm Booking
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[16px] border border-[#CFC7BE] bg-[#F8F4EF] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D8D0C8] bg-[#F8F4EF] px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md">
                  <img
                    src={chatbotImage}
                    alt="Chatbot"
                    className="h-6 w-6 object-contain"
                  />
                </div>

                <div>
                  <h3 className="text-base font-black leading-none text-[#63242B]">
                    Chatbot
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-[#6B635E]">
                    Online · Ready to help
                  </p>
                </div>
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E7F8EA]">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]"></span>
              </div>
            </div>

            <div
              ref={chatScrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-[#F5F0EA] p-3"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex max-w-[82%] items-start gap-2">
                    {message.role === "bot" && (
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                        <img
                          src={chatbotImage}
                          alt="Chatbot"
                          className="h-4 w-4 object-contain"
                        />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "rounded-tr-none bg-[#63242B] text-white"
                          : "rounded-tl-none border border-[#E1D8CF] bg-white text-[#1A1A1A]"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>

                  <span className="mx-9 mt-1 text-[10px] font-semibold text-[#9C9289]">
                    {message.time}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    <img
                      src={chatbotImage}
                      alt="Chatbot"
                      className="h-4 w-4 object-contain"
                    />
                  </div>

                  <div className="flex gap-1 rounded-2xl rounded-tl-none border border-[#E1D8CF] bg-white px-3 py-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#63242B]"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#63242B] delay-75"></span>
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#63242B] delay-150"></span>
                  </div>
                </div>
              )}

              {showBookSlotButton && chatSelectedDay && chatSelectedTime && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => goToPayment("chatbot")}
                    className="rounded-xl bg-[#63242B] px-7 py-2.5 text-xs font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
                  >
                    Book Slot
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-[#D8D0C8] bg-[#F8F4EF] p-2.5">
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" && handleSendMessage()
                  }
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-[#9E5961] bg-white px-3 py-2.5 text-xs text-[#1A1A1A] outline-none transition placeholder:text-[#A79D95] focus:border-[#63242B] focus:ring-2 focus:ring-[#63242B]/10"
                />

                <button
                  onClick={handleSendMessage}
                  className="flex items-center gap-2 rounded-lg bg-[#63242B] px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:brightness-110 active:scale-95"
                >
                  Send <Send size={14} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function UseCasesPage({ onProfessionSelect, onBack }) {
  const professions = [
    {
      name: "Doctors",
      icon: <Stethoscope size={32} />,
      desc: "General practitioners and specialists.",
    },
    {
      name: "Dentists",
      icon: <Smile size={32} />,
      desc: "Orthodontists and oral hygiene clinics.",
    },
    {
      name: "Massage Therapists",
      icon: <Hand size={32} />,
      desc: "Spa, wellness, and recovery centers.",
    },
    {
      name: "Therapists & Psychologists",
      icon: <Brain size={32} />,
      desc: "Mental health and counseling services.",
    },
    {
      name: "Veterinarians",
      icon: <Dog size={32} />,
      desc: "Animal hospitals and pet care clinics.",
    },
    {
      name: "Physiotherapists",
      icon: <Accessibility size={32} />,
      desc: "Rehabilitation and movement specialists.",
    },
    {
      name: "Alternative Medicine",
      icon: <Leaf size={32} />,
      desc: "Acupuncture, Reiki, and holistic healing.",
    },
    {
      name: "Dental Hygienists",
      icon: <Sparkles size={32} />,
      desc: "Dedicated hygiene and scaling services.",
    },
  ];

  return (
    <div className="h-[calc(100vh-5.75rem)] overflow-hidden bg-[#F2EBE3] px-6 pb-4 pt-3 font-sans text-[#1A1A1A]">
      <div className="mx-auto flex h-full max-w-5xl flex-col">
        <header className="text-center">
          <h2 className="text-2xl font-black text-[#63242B] md:text-[2rem]">
            For Every Medical & Wellness Professional
          </h2>
          <p className="mx-auto mt-1.5 max-w-xl text-sm font-medium leading-relaxed text-[#6B635E]">
            Built for professionals across healthcare and wellness industries.
            Select your field to see how MediBook Pro adapts to your workflow.
          </p>
        </header>

        <div className="pt-1 pl-1 md:-ml-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-[#63242B] transition hover:opacity-70"
          >
            <ArrowLeft size={18} /> Back to Home
          </button>
        </div>

        <div className="mx-auto grid flex-1 content-start gap-2.5 py-2 md:-mt-1 md:w-[66%] md:grid-cols-2">
          {professions.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onProfessionSelect(item)}
              className="group flex cursor-pointer items-center gap-3.5 rounded-[20px] border border-[#63242B]/10 bg-[#F8F2EB] p-3.5 shadow-sm transition-all hover:border-[#63242B]/30 hover:shadow-md"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#63242B] text-[#F2EBE3] transition-transform group-hover:scale-110">
                {item.icon}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#1A1A1A] md:text-lg">
                  {item.name}
                </h3>
                <p className="text-xs font-medium leading-relaxed text-[#6B635E]">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandLogo({ type }) {
  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9 fill-white">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.972h-1.514c-1.491 0-1.956.932-1.956 1.887v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    );
  }

  if (type === "whatsapp") {
    return (
      <svg viewBox="0 0 32 32" className="h-9 w-9 fill-white">
        <path d="M16.04 2.67C8.67 2.67 2.68 8.65 2.68 16.02c0 2.35.62 4.65 1.8 6.67L2.57 29.33l6.8-1.79a13.27 13.27 0 0 0 6.67 1.8h.01c7.36 0 13.35-5.99 13.35-13.36S23.41 2.67 16.04 2.67zm0 24.41h-.01a11.1 11.1 0 0 1-5.66-1.55l-.41-.24-4.04 1.06 1.08-3.94-.27-.43a11.08 11.08 0 0 1-1.7-5.96c0-6.08 4.94-11.02 11.02-11.02 2.94 0 5.7 1.15 7.78 3.23a10.94 10.94 0 0 1 3.23 7.78c0 6.08-4.94 11.07-11.02 11.07zm6.04-8.28c-.33-.17-1.95-.96-2.25-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.05 1.29-.19.22-.39.25-.72.08-.33-.17-1.39-.51-2.65-1.63-.98-.87-1.64-1.95-1.83-2.28-.19-.33-.02-.51.15-.68.15-.15.33-.39.5-.58.17-.19.22-.33.33-.55.11-.22.06-.41-.03-.58-.08-.17-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.58.08-.88.41-.3.33-1.16 1.13-1.16 2.76s1.19 3.2 1.35 3.42c.17.22 2.34 3.57 5.67 5 .79.34 1.41.54 1.89.69.79.25 1.51.22 2.08.13.64-.1 1.95-.8 2.23-1.57.28-.77.28-1.43.19-1.57-.08-.14-.3-.22-.63-.39z" />
      </svg>
    );
  }

  if (type === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9">
        <defs>
          <linearGradient id="instaGradient" x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="#F58529" />
            <stop offset="45%" stopColor="#DD2A7B" />
            <stop offset="100%" stopColor="#8134AF" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="6" fill="url(#instaGradient)" />
        <path
          d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7A3 3 0 1 1 12 9a3 3 0 0 1 0 6zm5-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"
          fill="white"
        />
        <path
          d="M17.2 3.8H6.8a3 3 0 0 0-3 3v10.4a3 3 0 0 0 3 3h10.4a3 3 0 0 0 3-3V6.8a3 3 0 0 0-3-3zm1.2 13.4c0 .66-.54 1.2-1.2 1.2H6.8c-.66 0-1.2-.54-1.2-1.2V6.8c0-.66.54-1.2 1.2-1.2h10.4c.66 0 1.2.54 1.2 1.2v10.4z"
          fill="white"
        />
      </svg>
    );
  }

  if (type === "maps") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9">
        <path
          fill="#34A853"
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        />
        <path
          fill="#4285F4"
          d="M12 2v20s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          opacity="0.9"
        />
        <path
          fill="#FBBC05"
          d="M12 5.5A3.5 3.5 0 0 0 8.5 9c0 1.93 1.57 3.5 3.5 3.5V5.5z"
        />
        <path fill="#EA4335" d="M12 5.5v7A3.5 3.5 0 0 0 12 5.5z" />
        <circle cx="12" cy="9" r="1.6" fill="white" />
      </svg>
    );
  }

  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9">
        <rect x="3" y="4" width="18" height="17" rx="3" fill="#63242B" />
        <path d="M3 8h18" stroke="white" strokeWidth="2" />
        <path
          d="M8 2v4M16 2v4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="7" y="11" width="3" height="3" rx="1" fill="white" />
        <rect x="12" y="11" width="3" height="3" rx="1" fill="white" />
        <rect x="7" y="16" width="3" height="3" rx="1" fill="white" />
        <rect x="12" y="16" width="3" height="3" rx="1" fill="white" />
      </svg>
    );
  }

  if (type === "chatbot") {
    return (
      <img
        src={chatbotImage}
        alt="Chatbot"
        className="h-10 w-10 object-contain"
      />
    );
  }

  if (type === "debit") {
    return (
      <svg viewBox="0 0 64 44" className="h-10 w-14">
        <rect width="64" height="44" rx="8" fill="#111827" />
        <rect x="8" y="11" width="15" height="11" rx="2" fill="#D6A84F" />
        <rect
          x="8"
          y="30"
          width="34"
          height="3"
          rx="1.5"
          fill="white"
          opacity="0.8"
        />
        <rect
          x="8"
          y="35"
          width="22"
          height="3"
          rx="1.5"
          fill="white"
          opacity="0.45"
        />
      </svg>
    );
  }

  if (type === "credit") {
    return (
      <svg viewBox="0 0 64 44" className="h-10 w-14">
        <rect width="64" height="44" rx="8" fill="#CBD5E1" />
        <rect y="10" width="64" height="9" fill="#334155" />
        <rect x="8" y="29" width="35" height="3" rx="1.5" fill="white" />
        <rect
          x="8"
          y="35"
          width="24"
          height="3"
          rx="1.5"
          fill="white"
          opacity="0.75"
        />
      </svg>
    );
  }

  if (type === "phonepe") {
    return (
      <div className="grid h-10 w-10 translate-y-1 place-items-center rounded-full bg-[#5F259F] text-lg font-black text-white">
        पे
      </div>
    );
  }

  if (type === "gpay") {
    return (
      <div className="flex items-center text-2xl font-black">
        <span className="text-[#4285F4]">G</span>
        <span className="ml-1 text-[#EA4335]">P</span>
        <span className="text-[#FBBC05]">a</span>
        <span className="text-[#34A853]">y</span>
      </div>
    );
  }

  if (type === "paytm") {
    return (
      <div className="text-2xl font-black">
        <span className="text-[#002970]">Pay</span>
        <span className="text-[#00BAF2]">tm</span>
      </div>
    );
  }

  return null;
}

function AnimatedServiceCard({ heading, subtitle, items, prefix }) {
  return (
    <section className="mt-14">
      <header className="mb-6 text-center">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#63242B]">
          {heading}
        </p>

        <h3 className="text-xl font-black text-[#1A1A1A] md:text-2xl">
          {subtitle}
        </h3>
      </header>

      <div className="mx-auto max-w-sm overflow-hidden rounded-[26px] border border-[#63242B]/10 bg-white p-4 shadow-xl">
        <div className="relative h-[250px] overflow-hidden rounded-[22px] bg-[#F8F2EB]">
          <div className="absolute inset-x-0 top-5 z-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#63242B]">
              MediBook Pro
            </p>
          </div>

          <div className="absolute left-1/2 top-1/2 h-[140px] w-[245px] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
            {items.map((item, index) => (
              <motion.div
                key={item.name}
                initial={false}
                animate={{
                  y: ["115%", "0%", "0%", "-115%"],
                  opacity: [0, 1, 1, 0],
                  scale: [0.96, 1, 1, 0.96],
                }}
                transition={{
                  duration: 2.8,
                  delay: index * 2.8,
                  repeat: Infinity,
                  repeatDelay: (items.length - 1) * 2.8,
                  ease: [0.45, 0, 0.2, 1],
                  times: [0, 0.22, 0.78, 1],
                }}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] border border-[#63242B]/10 bg-white px-5 py-4 text-center shadow-lg"
              >
                <motion.div
                  animate={{
                    rotate: [0, -4, 4, 0],
                    scale: [1, 1.06, 1],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: index * 2.8 + 0.45,
                    repeat: Infinity,
                    repeatDelay: items.length * 2.8 - 1.8,
                    ease: "easeInOut",
                  }}
                  className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${item.color} text-white shadow-md`}
                >
                  <BrandLogo type={item.logo} />
                </motion.div>

                <p className="text-xs font-bold text-[#6B635E]">{prefix}</p>

                <h4 className="mt-1 text-xl font-black text-[#63242B]">
                  {item.name}
                </h4>
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((item, index) => (
              <motion.span
                key={item.name}
                animate={{
                  opacity: [0.25, 1, 0.25],
                  width: ["8px", "24px", "8px"],
                }}
                transition={{
                  duration: 2.8,
                  delay: index * 2.8,
                  repeat: Infinity,
                  repeatDelay: (items.length - 1) * 2.8,
                  ease: [0.45, 0, 0.2, 1],
                  times: [0, 0.25, 1],
                }}
                className="h-2 rounded-full bg-[#63242B]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationAnimation() {
  const integrations = [
    { name: "Facebook", color: "bg-[#1877F2]", logo: "facebook" },
    { name: "WhatsApp", color: "bg-[#25D366]", logo: "whatsapp" },
    { name: "Instagram", color: "bg-white", logo: "instagram" },
    { name: "Google Maps", color: "bg-white", logo: "maps" },
    { name: "Calendar", color: "bg-[#63242B]", logo: "calendar" },
    { name: "Chatbot", color: "bg-white", logo: "chatbot" },
  ];

  return (
    <AnimatedServiceCard
      heading="Integration"
      subtitle="Simply Book from Anywhere"
      items={integrations}
      prefix="Simply book via"
    />
  );
}

function PaymentAnimation() {
  const payments = [
    { name: "Debit Card", color: "bg-white", logo: "debit" },
    { name: "Credit Card", color: "bg-white", logo: "credit" },
    { name: "PhonePe", color: "bg-white", logo: "phonepe" },
    { name: "Google Pay", color: "bg-white", logo: "gpay" },
    { name: "Paytm", color: "bg-white", logo: "paytm" },
  ];

  return (
    <AnimatedServiceCard
      heading="Payment"
      subtitle="Payment via Secure Methods"
      items={payments}
      prefix="Payment via"
    />
  );
}

function FeaturesPage({ onBack }) {
  const [activePanel, setActivePanel] = useState(0);
  const wheelLockRef = useRef(false);
  const businessFeatures = [
    {
      title: "Coupon & Gift Card",
      desc: "Offer discounts and gift cards to attract new clients and reward loyal customers.",
      icon: <Ticket size={42} strokeWidth={3} />,
      bg: "bg-[#FFF2E5]",
      iconColor: "text-[#F59E0B]",
    },
    {
      title: "Sale of Product",
      desc: "Sell health, wellness, and clinic products directly through your booking platform.",
      icon: <ShoppingBag size={42} strokeWidth={3} />,
      bg: "bg-[#EAF4FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      title: "Membership",
      desc: "Create membership plans for regular clients and encourage repeat bookings.",
      icon: <BadgeCheck size={42} strokeWidth={3} />,
      bg: "bg-[#FFF7E8]",
      iconColor: "text-[#F59E0B]",
    },
    {
      title: "Loyalty System",
      desc: "Reward clients for repeat visits and build long-term customer loyalty.",
      icon: <Trophy size={42} strokeWidth={3} />,
      bg: "bg-[#FFF0DF]",
      iconColor: "text-[#EA580C]",
    },
    {
      title: "Packages",
      desc: "Offer service packages to increase bookings and provide better value to clients.",
      icon: <Package size={42} strokeWidth={3} />,
      bg: "bg-[#EAF3FF]",
      iconColor: "text-[#2563EB]",
    },
  ];

  const handleWheel = (event) => {
    const direction = Math.sign(event.deltaY);

    if (!direction || wheelLockRef.current) return;

    if (direction > 0 && activePanel === 0) {
      wheelLockRef.current = true;
      setActivePanel(1);
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }

    if (direction < 0 && activePanel === 1) {
      wheelLockRef.current = true;
      setActivePanel(0);
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  };

  return (
    <div
      onWheel={handleWheel}
      className="h-[calc(100vh-5.75rem)] overflow-hidden bg-[#F2EBE3] px-6 pb-4 pt-3 font-sans text-[#1A1A1A]"
    >
      <div className="mx-auto h-full max-w-6xl">
        <AnimatePresence mode="wait">
          {activePanel === 0 ? (
            <motion.div
              key="features-overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex h-full flex-col"
            >
              <header className="text-center">
                <h2 className="text-[1.9rem] font-black text-[#63242B] md:text-[2.6rem]">
                  Powerful Business Features
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#6B635E] md:text-base">
                  Everything you need to grow and run your medical or wellness
                  practice from one simple platform.
                </p>
              </header>

              <section className="mt-6 grid flex-1 grid-cols-1 content-start gap-5 md:grid-cols-2 lg:grid-cols-3">
                {businessFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, duration: 0.4 }}
                    className="group rounded-[24px] border border-[#63242B]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#63242B]/30 hover:shadow-xl"
                  >
                    <h3 className="text-lg font-black text-[#1A1A1A]">
                      {feature.title}
                    </h3>

                    <div className="mt-3 grid grid-cols-[auto_1fr] items-start gap-4">
                      <div
                        className={`grid h-16 w-16 place-items-center rounded-2xl ${feature.bg} ${feature.iconColor} shadow-sm transition-transform group-hover:scale-110`}
                      >
                        {feature.icon}
                      </div>

                      <p className="text-sm font-medium leading-relaxed text-[#6B635E]">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="features-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex h-full flex-col"
            >
              <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
                <IntegrationAnimation />
                <PaymentAnimation />
              </section>

              <section className="mt-10 rounded-[28px] border border-[#63242B]/10 bg-[#F8F2EB] p-8 text-center shadow-sm">
                <h3 className="text-2xl font-black text-[#63242B]">
                  Grow Your Practice with Smart Tools
                </h3>

                <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#6B635E]">
                  Use coupons, memberships, loyalty rewards, product sales, and
                  service packages to improve client retention and increase
                  revenue.
                </p>

                <button
                  onClick={onBack}
                  className="mt-6 rounded-xl bg-[#63242B] px-8 py-3 text-sm font-black text-[#F2EBE3] shadow-lg transition hover:brightness-110 active:scale-95"
                >
                  Back to Home
                </button>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [view]);

  const navItems = [
    { label: "Home", dropdown: false },
    { label: "Use Cases", dropdown: false },
    { label: "Features", dropdown: false },
    { label: "Pricing", dropdown: false },
  ];

  const isNavActive = (label) => {
    if (label === "Home") return view === "home";
    if (label === "Use Cases") return view === "use-cases";
    if (label === "Features") return view === "features";
    if (label === "Pricing") return view === "pricing" || view === "payment";
    return false;
  };

  return (
    <div
      className={`bg-[#F2EBE3] px-6 font-sans text-[#1A1A1A] ${
        view === "home"
          ? "h-screen overflow-hidden pt-2"
          : "min-h-screen overflow-x-hidden pt-2"
      }`}
    >
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="sticky top-0 z-50 mx-auto flex h-15 w-full max-w-7xl items-center justify-between rounded-[24px] border border-[#63242B]/10 bg-[#F8F2EB]/80 px-5 shadow-[0_20px_40px_rgba(26,26,26,0.08)] backdrop-blur-md"
      >
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => setView("home")}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#63242B] shadow-lg">
            <HeartPulse size={20} color="#F2EBE3" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight">
            MediBook <span className="text-[#63242B]">Pro</span>
          </h1>
        </div>

        <nav className="hidden flex-1 items-center justify-end gap-8 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Use Cases") setView("use-cases");
                else if (item.label === "Home") setView("home");
                else if (item.label === "Features") setView("features");
                else if (item.label === "Pricing") setView("pricing");
              }}
              className={`group flex items-center gap-1.5 text-sm font-semibold transition hover:text-[#63242B] ${
                isNavActive(item.label) ? "text-[#63242B]" : "text-[#1A1A1A]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </motion.header>

      <AnimatePresence mode="wait">
        {view === "home" && (
          <motion.main
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-4 flex w-full max-w-7xl flex-col items-center justify-between gap-6 lg:mt-6 lg:flex-row lg:items-center"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-[540px] text-center lg:-translate-y-10 lg:text-left"
            >
              <h2 className="text-4xl font-black leading-[1.1] md:text-5xl">
                Modern Booking for{" "}
                <span className="text-[#63242B]">Medical Professionals</span>
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[#6B635E] md:text-lg">
                Streamline your clinic&apos;s operations and provide a seamless
                booking experience.
              </p>
              <div className="mt-7">
                <button
                  onClick={() => setView("use-cases")}
                  className="rounded-xl bg-[#63242B] px-10 py-4 text-base font-bold text-[#F2EBE3] shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Get Started Free
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative flex flex-1 justify-center pr-0 lg:-translate-y-10 lg:justify-end lg:pr-6"
            >
              <div className="relative w-full max-w-[255px] md:max-w-[300px] lg:max-w-[330px]">
                <RandomFloatingElements />
                <img
                  src={doctorImage}
                  alt="Doctor"
                  className="relative z-20 h-auto w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.main>
        )}

        {view === "features" && (
          <FeaturesPage key="features" onBack={() => setView("home")} />
        )}

        {view === "use-cases" && (
          <UseCasesPage
            key="use-cases"
            onBack={() => setView("home")}
            onProfessionSelect={(prof) => {
              setSelectedProfession(prof);
              setView("pricing");
            }}
          />
        )}

        {view === "pricing" && (
          <PricingPage
            key="pricing"
            selectedProfession={selectedProfession}
            onBack={() => setView("use-cases")}
            onProceedToPayment={(details) => {
              setBookingDetails(details);
              setView("payment");
            }}
          />
        )}

        {view === "payment" && (
          <PaymentPage
            key="payment"
            bookingDetails={bookingDetails}
            onBack={() => setView("pricing")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RandomFloatingElements() {
  const elements = useMemo(() => {
    const data = [
      {
        id: "cal",
        type: "logo",
        delay: 0,
        color: "#63242B",
        content: (
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4" />
            <path d="M3 4h18v4H3z" fill="#EA4335" />
            <rect x="7" y="2" width="2" height="4" rx="1" fill="#FBBC04" />
            <rect x="15" y="2" width="2" height="4" rx="1" fill="#FBBC04" />
            <text
              x="50%"
              y="75%"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              textAnchor="middle"
            >
              24
            </text>
          </svg>
        ),
      },
      {
        id: "fb",
        type: "logo",
        delay: 2.5,
        color: "#1877F2",
        content: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      },
      {
        id: "ig",
        type: "logo",
        delay: 5,
        color: "#E4405F",
        content: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        ),
      },
      {
        id: "gg",
        type: "logo",
        delay: 7.5,
        color: "#4285F4",
        content: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.91s3.95-8.91 8.79-8.91c2.75 0 4.59 1.17 5.65 2.18l2.58-2.48C19.16 1.62 16.09 0 12.48 0 5.58 0 0 5.58 0 12.5S5.58 25 12.48 25c6.75 0 11.21-4.75 11.21-11.41 0-.81-.08-1.42-.19-2.07H12.48z" />
          </svg>
        ),
      },
      {
        id: "wa",
        type: "logo",
        delay: 10,
        color: "#25D366",
        content: (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.301-.15-1.78-.879-2.057-.979-.277-.1-.478-.15-.679.15-.201.301-.779.979-.955 1.179-.176.2-.351.226-.653.076-.301-.15-1.274-.469-2.426-1.496-.897-.8-1.501-1.787-1.677-2.088-.176-.301-.019-.464.131-.614.136-.135.301-.351.451-.527.15-.176.201-.301.301-.502.1-.201.05-.376-.025-.526-.075-.15-.679-1.637-.93-2.244-.244-.589-.494-.509-.679-.519-.176-.009-.377-.01-.577-.01-.201 0-.527.075-.803.376-.277.301-1.054 1.029-1.054 2.508 0 1.479 1.079 2.91 1.229 3.111.15.2 2.123 3.241 5.143 4.542.718.309 1.278.494 1.716.633.721.23 1.377.198 1.896.121.579-.085 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351zm-5.467 7.618v0a10.963 10.963 0 01-5.59-1.52l-.401-.238-4.159 1.091 1.11-4.053-.261-.415a10.957 10.957 0 01-1.682-5.836C1.025 4.966 6.136 0 12.443 0c3.056 0 5.93 1.189 8.087 3.35 2.158 2.16 3.344 5.034 3.343 8.09 0 6.475-5.111 11.442-11.418 11.442z" />
          </svg>
        ),
      },
      {
        id: "c1",
        type: "comment",
        text: "“Booking simple!”",
        delay: 1.25,
        color: "text-[#63242B]",
        bg: "bg-white",
      },
      {
        id: "c2",
        type: "comment",
        text: "“Saved me hours”",
        delay: 6.25,
        color: "text-white",
        bg: "bg-[#63242B]",
      },
      {
        id: "c3",
        type: "comment",
        text: "“Clinic essential”",
        delay: 8.75,
        color: "text-[#6B635E]",
        bg: "bg-white",
      },
    ];

    return data.map((item) => ({
      ...item,
      side: Math.random() > 0.5 ? "left" : "right",
      top: Math.floor(Math.random() * 65),
      offset: Math.floor(Math.random() * 40) + 10,
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes boldSequenceLoop {
          0% { opacity: 0; transform: scale(0.7) translateY(10px); filter: blur(5px); }
          5% { opacity: 1; transform: scale(1.05) translateY(0); filter: blur(0px); }
          22% { opacity: 1; transform: scale(1) translateY(-2px); }
          25% { opacity: 0; transform: scale(0.9) translateY(-10px); filter: blur(2px); }
          100% { opacity: 0; }
        }
      `}</style>

      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute z-30 hidden items-center justify-center lg:flex"
          style={{
            top: `${el.top}%`,
            [el.side === "left" ? "left" : "right"]: `-${el.offset}px`,
            animation: `boldSequenceLoop 12.5s infinite both`,
            animationDelay: `${el.delay}s`,
          }}
        >
          {el.type === "logo" ? (
            <div
              className="h-14 w-14 rounded-2xl border border-white/50 bg-white p-3 shadow-xl backdrop-blur-sm"
              style={{ color: el.color }}
            >
              {el.content}
            </div>
          ) : (
            <div
              className={`whitespace-nowrap rounded-full border border-[#63242B]/10 px-6 py-4 shadow-xl ${el.bg}`}
            >
              <p className={`text-base font-black ${el.color}`}>{el.text}</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
