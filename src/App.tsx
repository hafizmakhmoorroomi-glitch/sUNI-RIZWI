/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Clock, MapPin, Calendar, Heart, Bell, Info } from 'lucide-react';

const ramadanData: Record<string, { sehri: string; iftar: string }> = {
  "2026-02-19": { sehri: "05:23:17", iftar: "17:57:06" },
  "2026-02-20": { sehri: "05:22:17", iftar: "17:57:59" },
  "2026-02-21": { sehri: "05:21:16", iftar: "17:58:51" },
  "2026-02-22": { sehri: "05:20:13", iftar: "17:59:43" },
  "2026-02-23": { sehri: "05:19:10", iftar: "18:00:34" },
  "2026-02-24": { sehri: "05:18:05", iftar: "18:01:25" },
  "2026-02-25": { sehri: "05:16:59", iftar: "18:02:16" },
  "2026-02-26": { sehri: "05:15:52", iftar: "18:03:06" },
  "2026-02-27": { sehri: "05:14:44", iftar: "18:03:56" },
  "2026-02-28": { sehri: "05:13:35", iftar: "18:04:46" },
  "2026-03-01": { sehri: "05:12:05", iftar: "18:05:47" },
  "2026-03-02": { sehri: "05:10:53", iftar: "18:06:36" },
  "2026-03-03": { sehri: "05:09:41", iftar: "18:07:25" },
  "2026-03-04": { sehri: "05:08:28", iftar: "18:08:13" },
  "2026-03-05": { sehri: "05:07:13", iftar: "18:09:01" },
  "2026-03-06": { sehri: "05:05:58", iftar: "18:09:49" },
  "2026-03-07": { sehri: "05:04:43", iftar: "18:10:36" },
  "2026-03-08": { sehri: "05:03:26", iftar: "18:11:24" },
  "2026-03-09": { sehri: "05:02:09", iftar: "18:12:10" },
  "2026-03-10": { sehri: "05:00:50", iftar: "18:12:57" },
  "2026-03-11": { sehri: "04:59:31", iftar: "18:13:43" },
  "2026-03-12": { sehri: "04:58:12", iftar: "18:14:29" },
  "2026-03-13": { sehri: "04:56:51", iftar: "18:15:15" },
  "2026-03-14": { sehri: "04:55:30", iftar: "18:16:00" },
  "2026-03-15": { sehri: "04:54:09", iftar: "18:16:46" },
  "2026-03-16": { sehri: "04:52:47", iftar: "18:17:31" },
  "2026-03-17": { sehri: "04:51:24", iftar: "18:18:16" },
  "2026-03-18": { sehri: "04:50:00", iftar: "18:19:01" },
  "2026-03-19": { sehri: "04:48:37", iftar: "18:19:46" },
  "2026-03-20": { sehri: "04:47:12", iftar: "18:20:31" }
};

const duas = [
  {
    title: "سحری کی دعا",
    arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
    urdu: "اور میں نے کل کے رمضان کے روزے کی نیت کی",
  },
  {
    title: "افطار کی دعا",
    arabic: "اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ امنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ",
    urdu: "اے اللہ! میں نے تیرے ہی لیے روزہ رکھا اور تجھ پر ہی ایمان لایا اور تجھ پر ہی بھروسہ کیا اور تیرے ہی دیے ہوئے رزق سے افطار کیا",
  }
];

function formatTo12Hour(timeStr: string) {
  if (!timeStr) return "--:--:--";
  const [hoursStr, minutes, seconds] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

function formatShortTime(timeStr: string) {
  if (!timeStr) return "--:--";
  const [hoursStr, minutes] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [displayData, setDisplayData] = useState<{
    sehri: string;
    iftar: string;
    targetText: string;
    countdown: { h: string; m: string; s: string };
    isFinished: boolean;
    isBefore: boolean;
    currentDua: number;
    fajr: string;
    maghrib: string;
  }>({
    sehri: "--:--:--",
    iftar: "--:--:--",
    targetText: "لوڈ ہو رہا ہے...",
    countdown: { h: "00", m: "00", s: "00" },
    isFinished: false,
    isBefore: false,
    currentDua: 0,
    fajr: "--:--",
    maghrib: "--:--",
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const todayTimes = ramadanData[todayStr];

    if (todayTimes) {
      const sehriDateTime = new Date(`${todayStr}T${todayTimes.sehri}`);
      const iftarDateTime = new Date(`${todayStr}T${todayTimes.iftar}`);

      let targetTime: Date;
      let targetText: string;
      let displaySehri = todayTimes.sehri;
      let displayIftar = todayTimes.iftar;
      let duaIndex = 0;

      if (now < sehriDateTime) {
        targetTime = sehriDateTime;
        targetText = "سحری ختم ہونے میں باقی وقت";
        duaIndex = 0;
      } else if (now < iftarDateTime) {
        targetTime = iftarDateTime;
        targetText = "افطار ہونے میں باقی وقت";
        duaIndex = 1;
      } else {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tmrwYear = tomorrow.getFullYear();
        const tmrwMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tmrwDay = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowStr = `${tmrwYear}-${tmrwMonth}-${tmrwDay}`;

        const tomorrowTimes = ramadanData[tomorrowStr];

        if (tomorrowTimes) {
          targetTime = new Date(`${tomorrowStr}T${tomorrowTimes.sehri}`);
          targetText = "اگلی سحری میں باقی وقت";
          displaySehri = tomorrowTimes.sehri;
          displayIftar = tomorrowTimes.iftar;
          duaIndex = 0;
        } else {
          setDisplayData(prev => ({
            ...prev,
            sehri: formatTo12Hour(todayTimes.sehri),
            iftar: formatTo12Hour(todayTimes.iftar),
            targetText: "رمضان المبارک اختتام پذیر ہوا",
            countdown: { h: "00", m: "00", s: "00" },
            isFinished: true,
            fajr: formatShortTime(todayTimes.sehri),
            maghrib: formatShortTime(todayTimes.iftar),
          }));
          return;
        }
      }

      const diff = Math.max(0, targetTime.getTime() - now.getTime());
      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

      setDisplayData({
        sehri: formatTo12Hour(displaySehri),
        iftar: formatTo12Hour(displayIftar),
        targetText,
        countdown: { h, m, s },
        isFinished: false,
        isBefore: false,
        currentDua: duaIndex,
        fajr: formatShortTime(displaySehri),
        maghrib: formatShortTime(displayIftar),
      });
    } else {
      const firstDayDate = new Date(`2026-02-19T00:00:00`);
      if (now < firstDayDate) {
        const firstSehriTime = new Date(`2026-02-19T${ramadanData["2026-02-19"].sehri}`);
        const diff = firstSehriTime.getTime() - now.getTime();
        const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

        setDisplayData({
          sehri: "--:--:--",
          iftar: "--:--:--",
          targetText: "رمضان المبارک کی آمد میں باقی وقت",
          countdown: { h, m, s },
          isFinished: false,
          isBefore: true,
          currentDua: 0,
          fajr: "--:--",
          maghrib: "--:--",
        });
      }
    }
  }, [now]);

  return (
    <div className="min-h-screen atmosphere urdu-text relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px] glow-effect" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#064e3b]/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
      >
        {/* Left Column: Main Display */}
        <div className="lg:col-span-7 space-y-6">
          <header className="space-y-2 text-center lg:text-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium mb-2"
            >
              <MapPin size={14} />
              <span>گوجرخان، پاکستان</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
              سنی رضوی <span className="text-[#D4AF37]">اتحاد کونسل</span>
            </h1>
            <p className="text-xl text-white/60 font-urdu">رمضان المبارک ۱۴۴۷ پورٹل</p>
          </header>

          <div className="glass-card rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
            
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="text-center">
                <p className="text-[#D4AF37] text-lg font-medium mb-4 flex items-center justify-center gap-2">
                  <Clock size={18} />
                  {displayData.targetText}
                </p>
                <div className="flex items-center gap-4 md:gap-8" dir="ltr">
                  {[
                    { label: 'Hours', val: displayData.countdown.h },
                    { label: 'Minutes', val: displayData.countdown.m },
                    { label: 'Seconds', val: displayData.countdown.s }
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col items-center">
                      <motion.div 
                        key={unit.val}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-bold font-mono text-white tabular-nums tracking-tighter"
                      >
                        {unit.val}
                      </motion.div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-2">{unit.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                    <Sun size={14} className="text-[#D4AF37]" />
                    <span>وقتِ سحری</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold font-mono text-white" dir="ltr">
                    {displayData.sehri}
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                    <Moon size={14} className="text-[#D4AF37]" />
                    <span>وقتِ افطار</span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold font-mono text-white" dir="ltr">
                    {displayData.iftar}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prayer Times Grid */}
          <div className="glass-card rounded-[2rem] p-6">
            <h3 className="text-center text-[#D4AF37] text-xl font-bold mb-6 flex items-center justify-center gap-2">
              <Bell size={18} />
              اوقاتِ نماز (فقہ حنفی)
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: 'فجر', time: displayData.fajr },
                { name: 'ظہر', time: '01:30 PM' },
                { name: 'عصر', time: '04:45 PM' },
                { name: 'مغرب', time: displayData.maghrib },
                { name: 'عشاء', time: '08:00 PM' }
              ].map((prayer) => (
                <div key={prayer.name} className="bg-white/5 border border-[#D4AF37]/20 rounded-2xl p-4 text-center hover:bg-[#D4AF37]/10 transition-colors">
                  <span className="block text-[#f1c40f] text-lg font-bold mb-1">{prayer.name}</span>
                  <span className="block text-sm font-mono text-white" dir="ltr">{prayer.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Content & Details */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          {/* Announcement Marquee */}
          <div className="glass-card rounded-2xl overflow-hidden flex items-center border-l-4 border-r-4 border-[#D4AF37]">
            <div className="bg-[#D4AF37] text-[#003214] px-4 py-3 font-bold text-lg whitespace-nowrap flex items-center gap-2 z-10">
              <Info size={18} />
              اعلانات:
            </div>
            <div className="flex-1 marquee-container py-3">
              <div className="marquee-content text-white text-lg font-medium">
                سنی رضوی اتحاد کونسل گوجرخان کے پورٹل میں خوش آمدید۔ ** یہاں آپ مسجد کے اہم اعلانات، چندے کی اپیل، یا کسی دکان / کاروبار کا اشتہار چلا سکتے ہیں۔ ** نمازِ جمعہ کی اذان 1:00 بجے اور جماعت 1:30 بجے ہوگی۔
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-6 text-center">
              <div className="inline-flex p-3 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                <Heart size={24} />
              </div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={displayData.currentDua}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6"
                >
                  <h3 className="text-2xl font-bold text-[#D4AF37]">{duas[displayData.currentDua].title}</h3>
                  <p className="text-3xl md:text-4xl font-amiri leading-relaxed text-white">
                    {duas[displayData.currentDua].arabic}
                  </p>
                  <p className="text-lg text-white/60 font-urdu leading-relaxed">
                    {duas[displayData.currentDua].urdu}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#D4AF37]">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider">آج کی تاریخ</p>
                <p className="text-lg font-medium">
                  {now.toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider">اسلامی سال</p>
              <p className="text-lg font-medium text-[#D4AF37]">۱۴۴۷ ہجری</p>
            </div>
          </div>

          <footer className="text-center lg:text-right px-4">
            <p className="text-sm text-white/30 leading-relaxed">
              اوقات بمطابق: دعوت اسلامی (رمضان ۲۰۲۶/۱۴۴۷)<br />
              یوسف آباد، ڈھوک ابرا، گوجر خان
            </p>
          </footer>
        </div>
      </motion.div>

      {/* Floating Decoration */}
      <div className="fixed bottom-8 left-8 z-20 hidden md:block">
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-t from-[#D4AF37] to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] rotate-180 [writing-mode:vertical-lr]">
            Ramadan Mubarak
          </span>
        </div>
      </div>
    </div>
  );
}
