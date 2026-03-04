import React, { useState, useEffect } from 'react';

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

function formatTo12HourJSX(timeStr: string) {
  if (!timeStr) return <>--:--:--<br /><span className="ampm-text">--</span></>;
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const seconds = parts[2] ? parts[2] : "00";
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return (
    <>
      {String(hours).padStart(2, '0')}:{minutes}:{seconds}
      <br />
      <span className="ampm-text">{ampm}</span>
    </>
  );
}

function formatShortTime(timeStr: string) {
  if (!timeStr) return "--:--";
  const parts = timeStr.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'failed'>('syncing');
  const [displayData, setDisplayData] = useState({
    sehri: "--:--:--",
    iftar: "--:--:--",
    fajr: "--:--",
    maghrib: "--:--",
    targetText: "وقت کا حساب ہو رہا ہے...",
    countdown: "00:00:00",
    dateStr: "",
    isPreRamadan: false,
  });

  // Time Sync Logic
  useEffect(() => {
    const syncTime = async () => {
      try {
        const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Karachi', {
          cache: "no-store",
          headers: { "Accept": "application/json" }
        });
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        const serverTime = new Date(data.dateTime + "+05:00").getTime();
        const localTime = Date.now();
        setTimeOffset(serverTime - localTime);
        setSyncStatus('synced');
      } catch (err) {
        console.warn("Time sync failed, using local time", err);
        setSyncStatus('failed');
      }
    };
    syncTime();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const formattedParts = formatter.format(now).split('/');
    const dd = formattedParts[0];
    const mm = formattedParts[1];
    const yyyy = formattedParts[2];
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const todayTimes = ramadanData[todayStr];

    if (todayTimes) {
      const sehriDateTime = new Date(`${todayStr}T${todayTimes.sehri}+05:00`);
      const iftarDateTime = new Date(`${todayStr}T${todayTimes.iftar}+05:00`);

      let targetTime: Date;
      let targetText: string;
      let displaySehri = todayTimes.sehri;
      let displayIftar = todayTimes.iftar;

      if (now.getTime() < sehriDateTime.getTime()) {
        targetTime = sehriDateTime;
        targetText = "سحری ختم ہونے میں باقی وقت:";
      } else if (now.getTime() < iftarDateTime.getTime()) {
        targetTime = iftarDateTime;
        targetText = "افطار ہونے میں باقی وقت:";
      } else {
        const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        const tmrwParts = formatter.format(tomorrow).split('/');
        const tomorrowStr = `${tmrwParts[2]}-${tmrwParts[1]}-${tmrwParts[0]}`;
        const tomorrowTimes = ramadanData[tomorrowStr];

        if (tomorrowTimes) {
          targetTime = new Date(`${tomorrowStr}T${tomorrowTimes.sehri}+05:00`);
          targetText = "اگلی سحری میں باقی وقت:";
          displaySehri = tomorrowTimes.sehri;
          displayIftar = tomorrowTimes.iftar;
        } else {
          setDisplayData({
            sehri: displaySehri,
            iftar: displayIftar,
            fajr: formatShortTime(displaySehri),
            maghrib: formatShortTime(displayIftar),
            targetText: "رمضان المبارک اختتام پذیر ہوا",
            countdown: "عید مبارک",
            dateStr: `${dd}-${mm}-${yyyy}`,
            isPreRamadan: false,
          });
          return;
        }
      }

      const diff = Math.max(0, targetTime.getTime() - now.getTime());
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setDisplayData({
        sehri: displaySehri,
        iftar: displayIftar,
        fajr: formatShortTime(displaySehri),
        maghrib: formatShortTime(displayIftar),
        targetText,
        countdown: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        dateStr: `${dd}-${mm}-${yyyy}`,
        isPreRamadan: false,
      });
    } else {
      const firstDayDate = new Date(`2026-02-19T00:00:00+05:00`);
      if (now.getTime() < firstDayDate.getTime()) {
        const firstSehriTime = new Date(`2026-02-19T${ramadanData["2026-02-19"].sehri}+05:00`);
        const diff = firstSehriTime.getTime() - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        setDisplayData({
          sehri: "--:--:--",
          iftar: "--:--:--",
          fajr: "--:--",
          maghrib: "--:--",
          targetText: "رمضان کی آمد میں باقی وقت:",
          countdown: `${d} دن, ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
          dateStr: `${dd}-${mm}-${yyyy}`,
          isPreRamadan: true,
        });
      }
    }
  }, [now]);

  return (
    <div className="container">
      <h1>سنی رضوی اتحاد کونسل</h1>
      <h2>گوجرخان</h2>
      
      <div className="date-display">
        {syncStatus === 'syncing' ? "وقت سیٹ ہو رہا ہے..." : `آج کی تاریخ: ${displayData.dateStr}`}
      </div>
      <br />
      <div className="live-time-badge" style={{ color: syncStatus === 'synced' ? '#2ecc71' : '#f1c40f' }}>
        {syncStatus === 'syncing' && "وقت کنیکٹ ہو رہا ہے..."}
        {syncStatus === 'synced' && "🟢 لائیو پاکستان سٹینڈرڈ ٹائم"}
        {syncStatus === 'failed' && "🟡 ڈیوائس ٹائم (سرور بزی ہے)"}
      </div>

      {/* سحری و افطار */}
      <div className="times-box">
        <div className="time-item">
          <span className="time-title">وقتِ سحری</span>
          <span className="time-value">
            {formatTo12HourJSX(displayData.sehri)}
          </span>
        </div>
        <div className="time-item">
          <span className="time-title">وقتِ افطار</span>
          <span className="time-value">
            {formatTo12HourJSX(displayData.iftar)}
          </span>
        </div>
      </div>

      {/* الٹی گنتی */}
      <div className="countdown-box">
        <div className="countdown-title">{displayData.targetText}</div>
        <div className="timer" style={{ fontSize: displayData.isPreRamadan ? '2.2rem' : '2.8rem' }}>
          {displayData.countdown}
        </div>
      </div>

      {/* نمازوں کے اوقات */}
      <div className="prayers-title">اوقاتِ نماز (فقہ حنفی)</div>
      <div className="prayers-grid">
        <div className="prayer-card">
          <span className="prayer-name">فجر</span>
          <span className="prayer-time">{displayData.fajr}</span>
        </div>
        <div className="prayer-card">
          <span className="prayer-name">ظہر</span>
          <span className="prayer-time">01:30 PM</span> 
        </div>
        <div className="prayer-card">
          <span className="prayer-name">عصر</span>
          <span className="prayer-time">04:45 PM</span> 
        </div>
        <div className="prayer-card">
          <span className="prayer-name">مغرب</span>
          <span className="prayer-time">{displayData.maghrib}</span>
        </div>
        <div className="prayer-card">
          <span className="prayer-name">عشاء</span>
          <span className="prayer-time">08:00 PM</span> 
        </div>
      </div>

      {/* مستقل اعلانات */}
      <div className="announcement-box">
        <div className="announcement-header">📢 اہم اعلان</div>
        <div className="announcement-body">
          سنی رضوی اتحاد کونسل کے تحت مرکزی جامع مسجد میں <br />ہر ماہ کے پہلے جمعہ کو نمازِ عشاء کے فوراً بعد
          <span className="highlight-dars">درسِ قرآن</span>
          ہوتا ہے۔
        </div>
      </div>
      
      <div className="footer">
        اوقات بمطابق: دعوت اسلامی (رمضان 2026/1447)<br />
        یوسف آباد، ڈھوک ابرا، گوجر خان
      </div>
    </div>
  );
}
