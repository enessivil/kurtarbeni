"use strict";

(() => {
  const $ = (id) => document.getElementById(id);

  // ---------- Sabitler & Güvenlik Sınırları ----------
  const STORAGE_KEY = "kurtarbeni_prefs_v2";
  const LEGACY_STORAGE_KEY = "kurtarbeni_prefs_v1";
  const DB_NAME = "kurtarbeni_audio_db";
  const DB_STORE = "ringtones";
  const KEY_AUDIO = "user_tone";
  const KEY_WALLPAPER = "user_wallpaper";
  const KEY_VOICE = "user_voice";
  const MAX_MEDIA_BYTES = 15 * 1024 * 1024;
  const SAMPLE_RATE = 22050;

  // ---------- Çoklu Dil Sözlüğü (TR / EN) ----------
  const I18N = {
    tr: {
      pageTitle: "KurtarBeni — Sahte Arama & Mesaj",
      brandPart1: "Kurtar",
      brandPart2: "Beni",
      desktopBadge: "KB-04 // %100 ÇEVRİMDIŞI · AÇIK KAYNAK",
      desktopDesc:
        "Sıradan sahte aramaların ötesinde: tırmanan mesaj→arama senaryo zinciri, çalışan hesap makinesi kılığı, telefon filtreli karşı taraf sesi ve sessiz güvenlik kısayolu.",
      feat1Title: "Tırmanan Senaryo Zinciri",
      feat1Desc:
        "Önce sakin bir mesaj, ardından acil ikinci mesaj ve son olarak aynı kişiden gerçekçi gelen arama.",
      feat2Title: "Hesap Makinesi Kılığı (Kamufle Mod)",
      feat2Desc:
        "Gerçek çalışan hesap makinesinde örneğin 15= yazdığında kimse fark etmeden 15 sn geri sayım başlar.",
      feat3Title: "Ahize Filtreli Ses & Sessiz SOS",
      feat3Desc:
        "Aramayı açınca telefon hattı sesi çalar; Beklet'e basılı tutarak güvendiğin kişiye hazır acil SMS açabilirsin.",
      footerTips: "Tüyolar & Rehber",
      footerLegal: "KVKK & Yasal Uyarı",
      offlineReady: "Çevrimdışı Hazır",
      offlineActive: "Çevrimdışı Önbellek Aktif",
      osDetected: {
        ios: "iOS algılandı · iPhone arayüzü aktif",
        android: "Android algılandı · Android arayüzü aktif",
        desktop: "Masaüstü algılandı · Önizleme modu"
      },
      navScenario: "Senaryo",
      navStyle: "Görünüm & Ses",
      navSafety: "Güvenlik",
      modeKicker: "Kaçış Modu",
      msgCardTitle: "Bildirim Akışı",
      installAndroidTitle: "Telefonuna Yükle (Çevrimdışı)",
      installAndroidDesc: "İnternet olmadan tek dokunuşla açmak için ana ekrana ekle.",
      installIosTitle: "iPhone Ana Ekranına Ekle",
      installIosDesc: "Safari alt menüden Paylaş simgesine dokun ve 'Ana Ekrana Ekle'yi seç.",
      installBtn: "Yükle",
      tabCall: "Arama",
      tabMsg: "Mesaj",
      tabChain: "Zincir",
      presetLabel: "Hızlı Senaryo",
      presets: {
        mom: {
          chip: "Annem",
          who: "Annem",
          sub: "Cep",
          msg: "Neredesin? Acil eve gelmen lazım!",
          c1: "Müsait misin? Bir şey söyleyeceğim",
          c2: "Kapıda kaldım, baksana telefona!!"
        },
        work: {
          chip: "İş",
          who: "Müdür / İş",
          sub: "İş",
          msg: "Toplantı öne çekildi, hemen döner misin?",
          c1: "Sunum dosyasında acil bir eksik çıktı",
          c2: "Müşteri bekliyor, hemen arıyorum"
        },
        courier: {
          chip: "Kurye",
          who: "Kurye",
          sub: "+90 532 ••• •• 41",
          msg: "Kapıdayım, paketi teslim edeceğim.",
          c1: "Siparişinizle 2 dakikaya kapıdayım",
          c2: "Zile bastım açan yok, arıyorum"
        },
        home: {
          chip: "Ev",
          who: "Ev Arkadaşım",
          sub: "Cep",
          msg: "Anahtarı içeride unuttum, acil ara!",
          c1: "Evde misin? Anahtarı bulamıyorum",
          c2: "Dışarıda kaldım acil aç telefonu!"
        }
      },
      defaultMsgLines: "Neredesin? Hemen eve gelmen lazım!\nMesajımı görmedin mi?\nAcil beni ara!",
      defaultSosMsg: "Şu an kendimi güvende hissetmiyorum, beni hemen arar mısın?",
      fallbackMsgs: [
        "Neredesin? Hemen döner misin?",
        "Mesajımı görmedin mi?",
        "Acil beni ara!",
        "Bekliyorum, önemli."
      ],
      unknownCaller: "Bilinmeyen",
      whoLabel: "Kimden?",
      subLabel: "Etiket / Numara",
      delayLabel: "Başlangıç Gecikmesi (sn)",
      msgCountLabel: "Mesaj Sayısı",
      msgGapLabel: "Aralık (sn)",
      msgTextLabel: "Mesajlar (her satır ayrı bildirim)",
      chainTitle: "Tırmanan Senaryo Akışı",
      chainSub: "Mesaj → Acil → Arama",
      chainStep1: "İlk Mesaj (Normal)",
      chainStep2: "İkinci Mesaj (Acil)",
      chainStep3: "Ardından otomatik gelen arama",
      chainGapLabel: "Adım aralığı",
      secUnit: "sn",
      osStyleLabel: "Ekran Stili (Android / iOS)",
      osCardAuto: "Otomatik",
      osCardAutoSub: "Cihaza göre",
      wpLabel: "Arka Plan / Duvar Kağıdı",
      wpTipLink: "İpucu",
      wpChooseBtn: "Duvar Kağıdı / SS Seç",
      removeBtn: "Kaldır",
      wpEmptyStatus: "Kendi duvar kağıdını veya boş ana ekran SS'ini seç; yalnızca bu cihazda saklanır.",
      wpActiveStatus: "Aktif duvar kağıdı: {name} (yalnızca bu cihazda)",
      wpBlurCheck: "Arama ekranında da bulanık arka plan olarak kullan",
      toneLabelCall: "Zil & Bildirim Sesi",
      toneLabelMsg: "Bildirim Sesi",
      testSoundPlay: "▶ Sesi Test Et",
      testSoundStop: "■ Durdur",
      toneOptAuto: "Cihaz Stiline Uygun (Otomatik)",
      toneOptIos: "iOS Tarzı Marimba / Modern",
      toneOptAndroid: "Android Tarzı Melodik",
      toneOptSoft: "Akustik Arp / Yumuşak",
      toneOptClassic: "Gerçekçi Klasik Zil",
      toneOptCustom: "Kendi Ses Dosyam (Cihazdan)",
      toneOptNone: "Sessiz (Yalnızca Titreşim)",
      toneShort: {
        auto: "Otomatik ses",
        ios_melody: "iOS zil",
        android_melody: "Android zil",
        soft: "Arp zil",
        classic: "Klasik zil",
        custom: "Özel ses",
        none: "Sessiz"
      },
      audioChooseBtn: "Ses Dosyası Seç (.mp3/.wav/.m4a)",
      audioEmptyStatus: "Kendi telefonunun zil sesini seçersen yalnızca cihazında (çevrimdışı) saklanır.",
      audioActiveStatus: "Yüklü ses: {name} (yalnızca bu cihazda saklanır)",
      ringtoneGuideLink: "Cihazına göre zil sesi isimleri & rehber →",
      calcCardTitle: "Hesap Makinesi Kılığı",
      calcOpenBtn: "Kılığa Geç",
      calcCardDesc:
        "Yanındakiler sadece hesap makinesi görür. İşlem girmeden sayı + '=' yaz (ör. 15=), seçtiğin mod sessizce başlar. Çıkmak için AC'ye 1.5 sn basılı tut.",
      voiceLabel: "Karşı Taraf Sesi (Ahize)",
      testVoicePlay: "▶ Dinle",
      testVoiceStop: "■ Durdur",
      voiceCardNone: "Kapalı",
      voiceCardNoneSub: "Sessiz",
      voiceCardAmbient: "Hat Ortamı",
      voiceCardAmbientSub: "GSM sesi",
      voiceCardCustom: "Ses Kaydım",
      voiceCardCustomSub: "Ahize filtresi",
      voiceChooseBtn: "Konuşma Ses Kaydı Seç",
      voiceVolLabel: "Ahize Fısıltı Seviyesi",
      voiceVolMin: "Çok kısık",
      voiceVolMid: "Fısıltı (Önerilen)",
      voiceVolMax: "Orta",
      voiceVolWhisperTag: "Fısıltı",
      voiceVolLowTag: "Kısık",
      voiceVolMedTag: "Orta",
      voiceSpeakerHint:
        "Tarayıcı kısıtı gereği kulaklık yoksa ses ana hoparlörden kısık çalar; kulağına yaklaştırdığında yalnızca senin duyacağın düzeye ayarla. Görüşmede Hoparlör'e basınca ses yükselir.",
      voiceEmptyStatus:
        "Seçtiğin kayıt 300–3400 Hz telefon filtresinden geçirilerek gerçek ahize konuşması gibi çalar; yalnızca cihazında kalır.",
      voiceActiveStatus: "Yüklü kayıt: {name} (300–3400 Hz telefon filtresiyle çalar)",
      sosTitle: "Sessiz Güvenlik Köprüsü (Acil SMS)",
      sosDesc:
        "Görüşme ekranında Beklet butonuna 2.5 sn basılı tutarsan, seçtiğin kişiye hazır SMS ekranı açılır. Acil durumda doğrudan 112'yi ara.",
      sosPhoneLabel: "Güvenilir Kişi Numarası (Opsiyonel)",
      sosMsgLabel: "Hazır Yardım Mesajı",
      tileTipsTitle: "Gerçekçilik Tüyoları",
      tileTipsSub: "SS & zil sesi rehberi",
      tileLegalTitle: "KVKK & Verilerim",
      tileLegalSub: "Gizlilik & sıfırla",
      summaryWpTag: "Duvar Kağıdı",
      summaryVoiceTag: "Hat Sesi",
      summarySosTag: "SOS Hazır",
      ctaStartCall: "Aramayı Başlat ve Karart",
      ctaStartMsg: "Mesajı Başlat ve Karart",
      ctaStartChain: "Zinciri Başlat ve Karart",
      waitText: "Güç tuşuna basma — ekran 2 sn içinde tamamen kararacak.",
      waitSub: "Telefonu masaya bırak. İptal için ekrana çift dokun.",
      cancelBtn: "İptal Et",
      backToSetup: "Ayarlara Dön",
      callingSuffix: " · arıyor…",
      onHoldPrefix: "Beklemede · ",
      callRemind: "Anımsat",
      callMessage: "Mesaj",
      declineLabel: "Reddet",
      endCallLabel: "Bitir",
      acceptLabel: "Cevapla",
      toolMute: "Sessiz",
      toolKeypad: "Klavye",
      toolSpeaker: "Hoparlör",
      toolHold: "Beklet",
      toolAdd: "Arama Ekle",
      toolContacts: "Kişiler",
      hideKeypad: "Gizle",
      calcError: "Hata",
      calcDot: ",",
      tipsModalTitle: "Gerçekçilik Tüyoları & Kamufle Rehberi",
      okBtn: "Tamam",
      legalModalTitle: "KVKK Aydınlatma & Yasal Uyarı",
      wipeBtn: "Tüm Yerel Verileri Sil",
      understoodBtn: "Anladım",
      copyBtn: "Kopyala",
      locale: "tr-TR",
      toasts: {
        installed: "Uygulama ana ekranına eklendi!",
        wiped: "Tüm yerel veriler cihazından silindi.",
        invalidImg: "Lütfen geçerli bir görsel dosyası (.jpg, .png, .webp) seç.",
        fileTooBig: "Dosya boyutu en fazla 15 MB olabilir.",
        wpSaved: "Arka plan yalnızca bu cihaza kaydedildi.",
        wpSession: "Arka plan bu oturum için yüklendi.",
        wpRemoved: "Arka plan varsayılana döndürüldü.",
        invalidAudio: "Lütfen geçerli bir ses dosyası (.mp3, .wav, .m4a) seç.",
        audioSaved: "Özel zil sesi cihazına kaydedildi.",
        audioSession: "Ses bu oturum için yüklendi.",
        audioRemoved: "Özel zil sesi kaldırıldı.",
        voiceSaved: "Konuşma kaydı ahize filtresiyle hazırlandı.",
        voiceSession: "Konuşma kaydı bu oturum için yüklendi.",
        voiceRemoved: "Konuşma kaydı kaldırıldı.",
        selectVoiceFirst: "Dinlemek için önce Hat Ortamı veya Ses Kaydım seç.",
        calcOpened: "Kamufle Mod: Sayı + '=' ile gizli başlat, AC basılı tut = çık.",
        calcCanceled: "Gizli sayaç iptal edildi.",
        sosNoPhone: "Acil SMS için önce Güvenlik sekmesinden numara ekle.",
        copied: "Arama metni kopyalandı: ",
        copiedShort: "Arama metni kopyalandı.",
        copyFailed: "Kopyalanamadı, metni manuel aratabilirsin."
      },
      tipsSections: [
        {
          h: "1. Hesap Makinesi Kılığı (Kamufle Mod)",
          p: "Üst bardaki Hesap Makinesi ikonundan veya Güvenlik sekmesinden uygulamayı gerçek bir hesap makinesine çevirebilirsin. Yanındaki biri baksa normal işlem yaptığını görür.",
          ul: [
            "Gizli Başlatma: İşlem girmeden sadece bir sayı yazıp '=' tuşuna bas (ör. 15=). Üst köşede belirsiz yeşil nokta yanar ve seçtiğin mod 15 sn sonra sessizce başlar.",
            "Normal Hesaplama: 24 + 18 = gibi normal işlemler gerçek hesap makinesi gibi çalışır.",
            "İptal / Ayarlara Dön: Geri sayımı iptal etmek için AC tuşuna iki kez bas; ayarlara dönmek için AC tuşuna 1.5 sn basılı tut."
          ]
        },
        {
          h: "2. Tırmanan Senaryo Zinciri & Karşı Taraf Sesi",
          ul: [
            "Zincir Modu: Önce normal bir mesaj, ardından acil ikinci mesaj ve hemen üstüne aynı kişiden gelen arama düşer — inandırıcılığı en yüksek moddur.",
            "Ahize Filtresi: Güvenlik sekmesinden Hat Ortamı veya kendi ses kaydını seçersen, aramayı cevapladığında 300–3400 Hz telefon filtresiyle çalar. Hoparlör tuşuna basınca ses artar, Beklet'te susar.",
            "Sessiz SOS: Güvenlik sekmesinde bir numara kaydettiysen, görüşme ekranında Beklet tuşuna 2.5 sn basılı tutarak hazır acil SMS ekranını açabilirsin."
          ]
        },
        {
          h: "3. Duvar Kağıdı, Güç Tuşu & Medya Sesi",
          ul: [
            "Duvar Kağıdı: Kilit ekranı SS'i yerine ham duvar kağıdı seçersen saat her zaman gerçek zamanlı kalır.",
            "Güç tuşuna basma: Ekranı kilitlemek yerine 2 saniyede açılan AMOLED siyah modda masaya bırak.",
            "Medya sesi: Başlatmadan önce telefonun Medya ses düzeyini aç."
          ]
        },
        {
          h: "4. Cihazının Varsayılan Zil Sesi İsimleri",
          p: "Marka zil sesleri telif haklarına (FSEK) tabi olduğu için koda eklenmez ve dış indirme sitelerine bağlantı verilmez. Yalnızca kendi cihazındaki mevcut ses dosyalarını veya kullanım hakkına sahip olduğun yasal ses kayıtlarını (.mp3/.wav/.m4a) Kendi Ses Dosyam alanına ekleyebilirsin:",
          guide: true
        }
      ],
      legalSections: [
        {
          h: "1. 6698 Sayılı KVKK Kapsamında Gizlilik & Barındırma",
          p1: "KurtarBeni tamamen tarayıcınızda (istemci tarafında) çalışan açık kaynaklı bir statik web uygulamasıdır. Hiçbir özel sunucu, veritabanı, çerez (cookie), reklam ağı, harici yazı tipi veya analitik aracı içermez.",
          p2: "Girdiğiniz arayan adı, mesaj metni, acil durum numarası, duvar kağıdı veya ses dosyaları geliştiriciye ya da üçüncü kişilere kesinlikle gönderilmez; yalnızca cihazınızın yerel deposunda (localStorage / IndexedDB) saklanır. Not: Statik dosyaların sunulduğu GitHub Pages altyapısı (GitHub, Inc.), kendi güvenlik politikaları kapsamında ziyaretçi IP adreslerini loglayabilir."
        },
        {
          h: "2. Yasal Kullanım, Sessiz SOS Sınırı & Sorumluluk Reddi",
          p1: "Bu uygulama yalnızca sosyal ortamlardan nazikçe ayrılmak, kişisel konfor sağlamak veya simülasyon amacıyla geliştirilmiştir.",
          ul: [
            "Sessiz SOS özelliği gerçek bir acil çağrı merkezi veya otomatik yardım sistemi değildir; yalnızca cihazın SMS uygulamasını önceden doldurulmuş taslakla açar. Mesajın gönderilmesi ve ulaşması tamamen kullanıcının kontrolündedir; gerçek acil durumlarda doğrudan 112 Acil Çağrı Merkezi'ni arayın.",
            "Uygulamanın; dolandırıcılık, tehdit, taciz, kişilik haklarına saldırı, sahte delil üretme veya 5237 sayılı Türk Ceza Kanunu'na aykırı herhangi bir amaçla kullanılması kesinlikle yasaktır.",
            "Uygulama 'olduğu gibi' (MIT Lisansı ile) sunulur; kullanımından doğabilecek tüm hukuki sorumluluk kullanıcıya aittir."
          ]
        },
        {
          h: "3. Marka & Telif Feragatnamesi",
          p1: "iPhone, iOS, Android, Samsung, One UI, Xiaomi, Google Pixel ve Huawei adları yalnızca uyumluluk ve bilgilendirme amacıyla anılmıştır; ilgili hak sahiplerinin tescilli markalarıdır ve bu projenin bu markalarla resmi bağlantısı yoktur."
        },
        {
          h: "4. Cihaz Verilerini Yönet",
          p1: "Cihazınızda kayıtlı tüm tercihleri, duvar kağıdını, ses dosyalarını, acil durum numarasını ve çevrimdışı önbelleği tek dokunuşla kalıcı olarak silebilirsiniz."
        }
      ]
    },
    en: {
      pageTitle: "RescueMe — Fake Call & Message Simulator",
      brandPart1: "Rescue",
      brandPart2: "Me",
      desktopBadge: "KB-04 // 100% OFFLINE · OPEN SOURCE",
      desktopDesc:
        "Beyond basic fake calls: an escalating message→call scenario chain, a working calculator disguise, phone-filtered caller audio, and a silent SOS shortcut.",
      feat1Title: "Escalating Scenario Chain",
      feat1Desc:
        "Starts with a calm text, follows up with an urgent second text, and finishes with a realistic incoming call.",
      feat2Title: "Calculator Disguise (Stealth Mode)",
      feat2Desc:
        "Type a number and '=' (e.g. 15=) on a working calculator to silently arm a 15-second countdown.",
      feat3Title: "Earpiece-Filtered Audio & Silent SOS",
      feat3Desc:
        "Plays realistic line ambience when answered; hold 'Hold' for 2.5s to open a pre-filled emergency SMS.",
      footerTips: "Tips & Guide",
      footerLegal: "Privacy & Legal",
      offlineReady: "Offline Ready",
      offlineActive: "Offline Cache Active",
      osDetected: {
        ios: "iOS detected · iPhone UI active",
        android: "Android detected · Android UI active",
        desktop: "Desktop detected · Preview mode"
      },
      navScenario: "Scenario",
      navStyle: "Look & Sound",
      navSafety: "Safety",
      modeKicker: "Escape Mode",
      msgCardTitle: "Notification Flow",
      installAndroidTitle: "Install on Your Phone (Offline)",
      installAndroidDesc: "Add to your home screen for one-tap offline access.",
      installIosTitle: "Add to iPhone Home Screen",
      installIosDesc: "Tap Share in Safari's bottom bar and choose 'Add to Home Screen'.",
      installBtn: "Install",
      tabCall: "Call",
      tabMsg: "Message",
      tabChain: "Chain",
      presetLabel: "Quick Scenario",
      presets: {
        mom: {
          chip: "Mom",
          who: "Mom",
          sub: "Mobile",
          msg: "Where are you? You need to come home right now!",
          c1: "Are you free? Need to tell you something",
          c2: "Locked out of the house, check your phone!!"
        },
        work: {
          chip: "Work",
          who: "Manager / Work",
          sub: "Work",
          msg: "Meeting got moved up, can you step out now?",
          c1: "Urgent issue came up in the deck",
          c2: "Client is waiting on the line, calling you"
        },
        courier: {
          chip: "Courier",
          who: "Delivery",
          sub: "+1 (555) •••-4192",
          msg: "I'm outside with your package.",
          c1: "Arriving at your door in 2 minutes",
          c2: "Rang the bell, no answer — calling now"
        },
        home: {
          chip: "Roommate",
          who: "Roommate",
          sub: "Mobile",
          msg: "Left my keys inside, call me ASAP!",
          c1: "Are you home? Can't find my keys",
          c2: "Stuck outside, please pick up!"
        }
      },
      defaultMsgLines: "Where are you? Need you home right now!\nDid you see my text?\nCall me ASAP!",
      defaultSosMsg: "I don't feel safe right now, can you please call me immediately?",
      fallbackMsgs: [
        "Where are you? Can you call back?",
        "Did you see my message?",
        "Call me ASAP!",
        "Waiting on you, it's urgent."
      ],
      unknownCaller: "Unknown",
      whoLabel: "Caller / Sender",
      subLabel: "Label / Number",
      delayLabel: "Start Delay (sec)",
      msgCountLabel: "Message Count",
      msgGapLabel: "Interval (sec)",
      msgTextLabel: "Messages (one notification per line)",
      chainTitle: "Escalating Scenario Flow",
      chainSub: "Text → Urgent → Call",
      chainStep1: "First Message (Calm)",
      chainStep2: "Second Message (Urgent)",
      chainStep3: "Followed automatically by an incoming call",
      chainGapLabel: "Step interval",
      secUnit: "sec",
      osStyleLabel: "Screen Style (Android / iOS)",
      osCardAuto: "Auto",
      osCardAutoSub: "Match device",
      wpLabel: "Wallpaper / Background",
      wpTipLink: "Tips",
      wpChooseBtn: "Choose Wallpaper / SS",
      removeBtn: "Remove",
      wpEmptyStatus: "Pick your phone wallpaper or a blank home screenshot; stored only on this device.",
      wpActiveStatus: "Active wallpaper: {name} (stored locally only)",
      wpBlurCheck: "Also use as blurred background on incoming call screen",
      toneLabelCall: "Ringtone & Alert Sound",
      toneLabelMsg: "Notification Sound",
      testSoundPlay: "▶ Test Sound",
      testSoundStop: "■ Stop",
      toneOptAuto: "Match Screen Style (Auto)",
      toneOptIos: "iOS-Style Marimba / Modern",
      toneOptAndroid: "Android-Style Melodic",
      toneOptSoft: "Acoustic Harp / Gentle",
      toneOptClassic: "Realistic Classic Bell",
      toneOptCustom: "Custom Audio File (From Device)",
      toneOptNone: "Silent (Vibrate Only)",
      toneShort: {
        auto: "Auto sound",
        ios_melody: "iOS ring",
        android_melody: "Android ring",
        soft: "Harp ring",
        classic: "Classic bell",
        custom: "Custom audio",
        none: "Silent"
      },
      audioChooseBtn: "Pick Audio File (.mp3/.wav/.m4a)",
      audioEmptyStatus: "Custom audio stays offline on your device only.",
      audioActiveStatus: "Loaded audio: {name} (stored locally only)",
      ringtoneGuideLink: "Default ringtone names by phone brand →",
      calcCardTitle: "Calculator Disguise",
      calcOpenBtn: "Open Disguise",
      calcCardDesc:
        "Looks and works like a real calculator. Type a number + '=' (e.g. 15=) to arm silently. Press and hold AC for 1.5s to return.",
      voiceLabel: "Caller Audio (Earpiece)",
      testVoicePlay: "▶ Preview",
      testVoiceStop: "■ Stop",
      voiceCardNone: "Off",
      voiceCardNoneSub: "Silent",
      voiceCardAmbient: "Line Ambience",
      voiceCardAmbientSub: "GSM noise",
      voiceCardCustom: "Voice Clip",
      voiceCardCustomSub: "Phone filter",
      voiceChooseBtn: "Pick Voice Recording",
      voiceVolLabel: "Earpiece Whisper Level",
      voiceVolMin: "Ultra low",
      voiceVolMid: "Whisper (Best)",
      voiceVolMax: "Medium",
      voiceVolWhisperTag: "Whisper",
      voiceVolLowTag: "Low",
      voiceVolMedTag: "Medium",
      voiceSpeakerHint:
        "Due to browser limits, audio plays quietly from the main speaker without headphones; tune it low enough to hear only near your ear. Tapping Speaker boosts volume.",
      voiceEmptyStatus:
        "Passed through a 300–3400 Hz telephone bandpass filter for realistic earpiece sound; stays on your device.",
      voiceActiveStatus: "Loaded clip: {name} (300–3400 Hz phone filter active)",
      sosTitle: "Silent Safety Bridge (Emergency SMS)",
      sosDesc:
        "Hold the 'Hold' button for 2.5s during an active call to open a pre-filled SMS to your trusted contact. Call 112/911 in real emergencies.",
      sosPhoneLabel: "Trusted Contact Number (Optional)",
      sosMsgLabel: "Pre-filled Help Message",
      tileTipsTitle: "Realism Tips",
      tileTipsSub: "Wallpaper & ringtones",
      tileLegalTitle: "Privacy & Data",
      tileLegalSub: "Terms & wipe data",
      summaryWpTag: "Wallpaper",
      summaryVoiceTag: "Line Audio",
      summarySosTag: "SOS Ready",
      ctaStartCall: "Start Call & Blackout",
      ctaStartMsg: "Start Messages & Blackout",
      ctaStartChain: "Start Chain & Blackout",
      waitText: "Do not press the power button — screen blacks out in 2s.",
      waitSub: "Place your phone on the table. Double-tap screen to cancel.",
      cancelBtn: "Cancel",
      backToSetup: "Back to Setup",
      callingSuffix: " · calling…",
      onHoldPrefix: "On Hold · ",
      callRemind: "Remind Me",
      callMessage: "Message",
      declineLabel: "Decline",
      endCallLabel: "End",
      acceptLabel: "Accept",
      toolMute: "Mute",
      toolKeypad: "Keypad",
      toolSpeaker: "Speaker",
      toolHold: "Hold",
      toolAdd: "Add Call",
      toolContacts: "Contacts",
      hideKeypad: "Hide",
      calcError: "Error",
      calcDot: ".",
      tipsModalTitle: "Realism Tips & Stealth Guide",
      okBtn: "Got it",
      legalModalTitle: "Privacy Notice & Legal Disclaimer",
      wipeBtn: "Wipe All Local Data",
      understoodBtn: "Understood",
      copyBtn: "Copy",
      locale: "en-US",
      toasts: {
        installed: "App added to your home screen!",
        wiped: "All local data has been wiped from this device.",
        invalidImg: "Please select a valid image file (.jpg, .png, .webp).",
        fileTooBig: "File size must be 15 MB or less.",
        wpSaved: "Wallpaper saved locally on this device.",
        wpSession: "Wallpaper loaded for this session.",
        wpRemoved: "Wallpaper reset to default.",
        invalidAudio: "Please select a valid audio file (.mp3, .wav, .m4a).",
        audioSaved: "Custom ringtone saved locally.",
        audioSession: "Audio loaded for this session.",
        audioRemoved: "Custom ringtone removed.",
        voiceSaved: "Voice clip ready with earpiece filter.",
        voiceSession: "Voice clip loaded for this session.",
        voiceRemoved: "Voice clip removed.",
        selectVoiceFirst: "Select Line Ambience or Voice Clip first to preview.",
        calcOpened: "Stealth Mode: Type number + '=' to arm silently, hold AC to exit.",
        calcCanceled: "Hidden countdown canceled.",
        sosNoPhone: "Add a trusted number in the Safety tab first.",
        copied: "Search query copied: ",
        copiedShort: "Search query copied.",
        copyFailed: "Could not copy automatically; please search manually."
      },
      tipsSections: [
        {
          h: "1. Calculator Disguise (Stealth Mode)",
          p: "Tap the Calculator icon in the top bar or launch it from the Safety tab to switch into a fully functional calculator. Anyone glancing at your screen only sees normal math.",
          ul: [
            "Secret Trigger: Type a number without an operator and press '=' (e.g. 15=). A subtle green dot pulses in the corner and your chosen mode starts silently after 15s.",
            "Normal Math: Standard expressions like 24 + 18 = work just like a real calculator.",
            "Cancel / Exit: Double-tap AC to cancel an armed countdown; press and hold AC for 1.5s to return to setup."
          ]
        },
        {
          h: "2. Escalating Scenario Chain & Caller Audio",
          ul: [
            "Chain Mode: Delivers a calm first message, an urgent second message, and then an incoming call from the same person — maximum realism.",
            "Earpiece Filter: Choose Line Ambience or upload your own voice clip in the Safety tab; it plays through a 300–3400 Hz phone filter when answered.",
            "Silent SOS: If you save a trusted number in the Safety tab, holding the 'Hold' button for 2.5s during a call opens a ready-to-send emergency SMS."
          ]
        },
        {
          h: "3. Wallpaper, Power Button & Media Volume",
          ul: [
            "Wallpaper: Use your raw wallpaper instead of a lock-screen screenshot so the live clock stays accurate.",
            "Don't lock the screen: Browsers suspend vibration when locked. Leave the phone face-up in the 2-second AMOLED blackout screen instead.",
            "Media volume: Turn up your phone's Media volume before starting."
          ]
        },
        {
          h: "4. Default Ringtone Names by Brand",
          p: "Brand ringtones are copyrighted and not bundled, and no third-party download sites are linked. Please only load audio files (.mp3/.wav/.m4a) already on your device or that you have the legal right to use under Custom Audio File:",
          guide: true
        }
      ],
      legalSections: [
        {
          h: "1. Zero-Server Privacy & Hosting Transparency (GDPR / KVKK)",
          p1: "RescueMe (KurtarBeni) is an open-source static web application running 100% client-side in your browser. It contains zero custom servers, databases, cookies, ad networks, external fonts, or analytics.",
          p2: "Any caller name, message text, emergency contact number, wallpaper, or audio file you select is never transmitted to the developer or third parties; it stays strictly in your browser's local storage (localStorage / IndexedDB). Note: Static files are hosted on GitHub Pages (GitHub, Inc.), which may log visitor IP addresses for security purposes under its own privacy statement."
        },
        {
          h: "2. Lawful Use, Silent SOS Limits & Disclaimer",
          p1: "This tool is built solely for politely exiting uncomfortable social situations, personal peace of mind, or harmless simulation.",
          ul: [
            "Silent SOS is NOT a real emergency dispatch or automated alert service; it only opens your device's SMS app with a pre-filled draft. Sending and delivery depend entirely on the user and carrier signal. In any real emergency, call 112 or 911 immediately.",
            "Using this application for fraud, harassment, threats, impersonation, or any unlawful purpose is strictly prohibited.",
            "Provided 'as is' under the MIT License; all legal responsibility rests solely with the user."
          ]
        },
        {
          h: "3. Trademark & Copyright Notice",
          p1: "iPhone, iOS, Android, Samsung, One UI, Xiaomi, Google Pixel, and Huawei are trademarks of their respective owners, referenced solely for compatibility and informational purposes with no official affiliation."
        },
        {
          h: "4. Manage Local Device Data",
          p1: "You can permanently wipe all saved preferences, wallpapers, audio files, emergency contacts, and offline caches from this device with one tap."
        }
      ]
    }
  };

  const RINGTONE_GUIDES = [
    { brand: "iPhone (iOS 17+)", name: "Reflection / Radial", query: "iPhone Reflection default ringtone" },
    { brand: "iPhone (Classic)", name: "Opening / Marimba", query: "iPhone Opening default ringtone" },
    { brand: "Samsung (One UI)", name: "Over the Horizon / Galaxy Bells", query: "Samsung Over the Horizon default ringtone" },
    { brand: "Xiaomi (HyperOS / MIUI)", name: "Mi Remix / Mi Jazz", query: "Xiaomi Mi Remix default ringtone" },
    { brand: "Google Pixel", name: "Your New Adventure", query: "Google Pixel Your New Adventure ringtone" },
    { brand: "Huawei / Honor", name: "Huawei Tune Living", query: "Huawei Tune Living default ringtone" }
  ];

  // ---------- Uygulama Durumu ----------
  const state = {
    lang: detectInitialLang(),
    setupTab: "scenario", // "scenario" | "style" | "safety"
    mode: "call", // "call" | "msg" | "chain"
    osPref: "auto", // "auto" | "android" | "ios"
    voicePref: "none", // "none" | "ambient" | "custom_voice"
    voiceVolume: 8, // 2..30 (%) — Hoparlör kapalıyken fısıltı seviyesi
    detectedOS: detectOS(),
    activeOS: "android",
    timers: [],
    audioCtx: null,
    player: new Audio(),
    notiPlayer: new Audio(),
    voiceFallbackEl: new Audio(),
    silentWavUrl: null,
    synthCache: Object.create(null),
    vibeInterval: null,
    talkInterval: null,
    wakeLock: null,
    isWaiting: false,
    waitingInDisguise: false,
    targetEndTime: 0,
    customAudioBlob: null,
    customAudioName: "",
    customAudioUrl: null,
    wallpaperBlob: null,
    wallpaperName: "",
    wallpaperUrl: null,
    customVoiceBlob: null,
    customVoiceName: "",
    customVoiceUrl: null,
    activeVoiceSource: null,
    activeVoiceGain: null,
    isCallMuted: false,
    isCallHeld: false,
    isCallSpeaker: false,
    deferredPrompt: null,
    lastTapTime: 0,
    isTestingSound: false,
    isTestingVoice: false,
    calc: {
      current: "0",
      prev: null,
      op: null,
      resetNext: false,
      lastAcTap: 0,
      acHoldTimer: null
    },
    sosHoldTimer: null,
    sosTriggered: false
  };

  state.player.preload = "auto";
  state.notiPlayer.preload = "auto";
  state.voiceFallbackEl.preload = "auto";

  // ---------- DOM Referansları ----------
  const el = {
    appShell: $("appShell"),
    detectedOsLabel: $("detectedOsLabel"),
    offlineStatusDesktop: $("offlineStatusDesktop"),
    langTrBtn: $("langTrBtn"),
    langEnBtn: $("langEnBtn"),
    summaryAvatar: $("summaryAvatar"),
    summaryWho: $("summaryWho"),
    summaryModePill: $("summaryModePill"),
    summaryMeta: $("summaryMeta"),
    navTabScenario: $("navTabScenario"),
    navTabStyle: $("navTabStyle"),
    navTabSafety: $("navTabSafety"),
    safetyActiveDot: $("safetyActiveDot"),
    paneScenario: $("paneScenario"),
    paneStyle: $("paneStyle"),
    paneSafety: $("paneSafety"),
    setupScroll: $("setupScroll"),
    installCard: $("installCard"),
    installTitle: $("installTitle"),
    installDesc: $("installDesc"),
    installActionBtn: $("installActionBtn"),
    dismissInstallBtn: $("dismissInstallBtn"),
    tabCall: $("tabCall"),
    tabMsg: $("tabMsg"),
    tabChain: $("tabChain"),
    presetRow: $("presetRow"),
    presetMom: $("presetMom"),
    presetWork: $("presetWork"),
    presetCourier: $("presetCourier"),
    presetHome: $("presetHome"),
    whoInput: $("whoInput"),
    subInput: $("subInput"),
    delayInput: $("delayInput"),
    delayMinusBtn: $("delayMinusBtn"),
    delayPlusBtn: $("delayPlusBtn"),
    quickDelays: $("quickDelays"),
    msgOptions: $("msgOptions"),
    msgCountInput: $("msgCountInput"),
    msgGapInput: $("msgGapInput"),
    msgTextInput: $("msgTextInput"),
    chainOptions: $("chainOptions"),
    chainMsg1Input: $("chainMsg1Input"),
    chainMsg2Input: $("chainMsg2Input"),
    chainGapInput: $("chainGapInput"),
    osChoiceGrid: $("osChoiceGrid"),
    wallpaperInput: $("wallpaperInput"),
    clearWallpaperBtn: $("clearWallpaperBtn"),
    wpThumb: $("wpThumb"),
    wpPlaceholderIcon: $("wpPlaceholderIcon"),
    wallpaperStatus: $("wallpaperStatus"),
    wpBlurCallToggle: $("wpBlurCallToggle"),
    homeBgImg: $("homeBgImg"),
    homeBgScrim: $("homeBgScrim"),
    callBgImg: $("callBgImg"),
    callBgScrim: $("callBgScrim"),
    toneLabel: $("toneLabel"),
    toneSelect: $("toneSelect"),
    testSoundBtn: $("testSoundBtn"),
    customAudioBox: $("customAudioBox"),
    customAudioInput: $("customAudioInput"),
    clearAudioBtn: $("clearAudioBtn"),
    customAudioStatus: $("customAudioStatus"),
    openCalcBtn: $("openCalcBtn"),
    openCalcCardBtn: $("openCalcCardBtn"),
    voiceChoiceGrid: $("voiceChoiceGrid"),
    voiceVolBox: $("voiceVolBox"),
    voiceVolSlider: $("voiceVolSlider"),
    voiceVolBadge: $("voiceVolBadge"),
    testVoiceBtn: $("testVoiceBtn"),
    customVoiceBox: $("customVoiceBox"),
    customVoiceInput: $("customVoiceInput"),
    clearVoiceBtn: $("clearVoiceBtn"),
    customVoiceStatus: $("customVoiceStatus"),
    sosPhoneInput: $("sosPhoneInput"),
    sosMsgInput: $("sosMsgInput"),
    startBtn: $("startBtn"),
    startBtnText: $("startBtnText"),
    screenSetup: $("screenSetup"),
    screenWait: $("screenWait"),
    screenCalc: $("screenCalc"),
    screenHome: $("screenHome"),
    screenCall: $("screenCall"),
    waitTimer: $("waitTimer"),
    cancelWaitBtn: $("cancelWaitBtn"),
    calcArmedDot: $("calcArmedDot"),
    calcExpr: $("calcExpr"),
    calcDisplay: $("calcDisplay"),
    calcGrid: $("calcGrid"),
    calcClearBtn: $("calcClearBtn"),
    calcDotBtn: $("calcDotBtn"),
    sbTimeHome: $("sbTimeHome"),
    sbTimeCall: $("sbTimeCall"),
    lockDate: $("lockDate"),
    lockClock: $("lockClock"),
    notiStack: $("notiStack"),
    homeBackBtn: $("homeBackBtn"),
    callRipple: $("callRipple"),
    callRipple2: $("callRipple2"),
    callInitial: $("callInitial"),
    callName: $("callName"),
    callSub: $("callSub"),
    inCallGrid: $("inCallGrid"),
    holdToolBtn: $("holdToolBtn"),
    dtmfPad: $("dtmfPad"),
    dtmfDisplay: $("dtmfDisplay"),
    dtmfKeys: $("dtmfKeys"),
    hideDtmfBtn: $("hideDtmfBtn"),
    callPreActions: $("callPreActions"),
    callActions: $("callActions"),
    declineBtn: $("declineBtn"),
    declineLabel: $("declineLabel"),
    acceptWrap: $("acceptWrap"),
    acceptBtn: $("acceptBtn"),
    tipsModal: $("tipsModal"),
    tipsModalBody: $("tipsModalBody"),
    openTipsBanner: $("openTipsBanner"),
    openTipsDesktop: $("openTipsDesktop"),
    openWallpaperTipBtn: $("openWallpaperTipBtn"),
    openRingtoneGuideBtn: $("openRingtoneGuideBtn"),
    closeTipsBtn: $("closeTipsBtn"),
    acceptTipsBtn: $("acceptTipsBtn"),
    legalModal: $("legalModal"),
    legalModalBody: $("legalModalBody"),
    openLegalBtn: $("openLegalBtn"),
    openLegalInline: $("openLegalInline"),
    openLegalDesktop: $("openLegalDesktop"),
    closeLegalBtn: $("closeLegalBtn"),
    acceptLegalBtn: $("acceptLegalBtn"),
    wipeDataBtn: $("wipeDataBtn"),
    toast: $("toast")
  };

  function t() {
    return I18N[state.lang] || I18N.tr;
  }

  // ---------- 1. Dil, Sekme & Canlı Özet ----------
  function detectInitialLang() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lang === "tr" || parsed.lang === "en") return parsed.lang;
      }
    } catch {
      // yoksay
    }
    const navLang = (navigator.language || "tr").toLowerCase();
    return navLang.startsWith("tr") ? "tr" : "en";
  }

  function detectOS() {
    const ua = navigator.userAgent || "";
    const platform =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      "";
    const isIOS =
      /iPad|iPhone|iPod/i.test(ua) ||
      (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
    if (isIOS) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "desktop";
  }

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function setSetupTab(tabName) {
    state.setupTab = tabName;
    const map = [
      [el.navTabScenario, el.paneScenario, "scenario"],
      [el.navTabStyle, el.paneStyle, "style"],
      [el.navTabSafety, el.paneSafety, "safety"]
    ];
    map.forEach(([tab, pane, key]) => {
      const active = key === tabName;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      pane.classList.toggle("is-active", active);
    });
    el.setupScroll.scrollTop = 0;
  }

  function updateSummaryCard() {
    const dict = t();
    const who = el.whoInput.value.trim() || dict.unknownCaller;
    const sub = el.subInput.value.trim() || dict.presets.mom.sub;
    const sec = clampInt(el.delayInput.value, 1, 3600, 5);

    el.summaryAvatar.textContent = who.charAt(0).toUpperCase() || "?";
    el.summaryWho.textContent = who;

    const modeName =
      state.mode === "call" ? dict.tabCall : state.mode === "msg" ? dict.tabMsg : dict.tabChain;
    el.summaryModePill.textContent = modeName + " · " + sec + " " + dict.secUnit;

    const tags = [sub, dict.toneShort[el.toneSelect.value] || dict.toneShort.auto];
    if (state.wallpaperBlob) tags.push(dict.summaryWpTag);
    if (state.voicePref !== "none") tags.push(dict.summaryVoiceTag);
    const hasSos = Boolean(sanitizePhone(el.sosPhoneInput.value).trim());
    if (hasSos) tags.push(dict.summarySosTag);

    el.summaryMeta.textContent = tags.join(" · ");
    el.safetyActiveDot.classList.toggle("is-hidden", state.voicePref === "none" && !hasSos);

    el.startBtnText.textContent =
      state.mode === "call"
        ? dict.ctaStartCall
        : state.mode === "msg"
          ? dict.ctaStartMsg
          : dict.ctaStartChain;
  }

  function setOSChoice(val, persist = true) {
    state.osPref = ["auto", "android", "ios"].includes(val) ? val : "auto";
    el.osChoiceGrid.querySelectorAll(".choice-card").forEach((card) => {
      const active = card.dataset.os === state.osPref;
      card.classList.toggle("is-selected", active);
      card.setAttribute("aria-checked", String(active));
    });
    applyOSTheme();
    if (persist) savePrefs();
  }

  function setVoiceChoice(val, persist = true) {
    state.voicePref = ["none", "ambient", "custom_voice"].includes(val) ? val : "none";
    el.voiceChoiceGrid.querySelectorAll(".choice-card").forEach((card) => {
      const active = card.dataset.voice === state.voicePref;
      card.classList.toggle("is-selected", active);
      card.setAttribute("aria-checked", String(active));
    });
    stopTestVoice();
    updateCustomVoiceUI();
    updateSummaryCard();
    if (persist) savePrefs();
  }

  function renderModalsContent() {
    const dict = t();

    el.tipsModalBody.replaceChildren();
    dict.tipsSections.forEach((sec) => {
      const h4 = document.createElement("h4");
      h4.textContent = sec.h;
      el.tipsModalBody.appendChild(h4);

      if (sec.p) {
        const p = document.createElement("p");
        p.textContent = sec.p;
        el.tipsModalBody.appendChild(p);
      }
      if (sec.ul) {
        const ul = document.createElement("ul");
        sec.ul.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        el.tipsModalBody.appendChild(ul);
      }
      if (sec.guide) {
        const list = document.createElement("div");
        list.className = "ringtone-guide-list";
        RINGTONE_GUIDES.forEach((g) => {
          const row = document.createElement("div");
          row.className = "rg-item";

          const info = document.createElement("div");
          info.className = "rg-info";
          const st = document.createElement("strong");
          st.textContent = g.brand;
          const sp = document.createElement("span");
          sp.textContent = g.name;
          info.appendChild(st);
          info.appendChild(sp);

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "copy-pill";
          btn.dataset.copy = g.query;
          btn.textContent = dict.copyBtn;

          row.appendChild(info);
          row.appendChild(btn);
          list.appendChild(row);
        });
        el.tipsModalBody.appendChild(list);
      }
    });

    el.legalModalBody.replaceChildren();
    dict.legalSections.forEach((sec) => {
      const h4 = document.createElement("h4");
      h4.textContent = sec.h;
      el.legalModalBody.appendChild(h4);

      if (sec.p1) {
        const p1 = document.createElement("p");
        p1.textContent = sec.p1;
        el.legalModalBody.appendChild(p1);
      }
      if (sec.p2) {
        const p2 = document.createElement("p");
        p2.textContent = sec.p2;
        el.legalModalBody.appendChild(p2);
      }
      if (sec.ul) {
        const ul = document.createElement("ul");
        sec.ul.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        });
        el.legalModalBody.appendChild(ul);
      }
    });
  }

  function applyLanguage(newLang, swapDefaultInputs = false, persist = true) {
    const prevDict = t();
    state.lang = newLang === "en" ? "en" : "tr";
    const dict = t();

    document.documentElement.lang = state.lang;
    document.title = dict.pageTitle;

    el.langTrBtn.classList.toggle("is-active", state.lang === "tr");
    el.langEnBtn.classList.toggle("is-active", state.lang === "en");

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (key && typeof dict[key] === "string") {
        node.textContent = dict[key];
      }
    });

    el.presetMom.textContent = dict.presets.mom.chip;
    el.presetWork.textContent = dict.presets.work.chip;
    el.presetCourier.textContent = dict.presets.courier.chip;
    el.presetHome.textContent = dict.presets.home.chip;

    if (swapDefaultInputs) {
      const prevMom = prevDict.presets.mom;
      if (el.whoInput.value === prevMom.who) el.whoInput.value = dict.presets.mom.who;
      if (el.subInput.value === prevMom.sub) el.subInput.value = dict.presets.mom.sub;
      if (el.msgTextInput.value.trim() === prevDict.defaultMsgLines.trim()) {
        el.msgTextInput.value = dict.defaultMsgLines;
      }
      if (el.chainMsg1Input.value === prevMom.c1) el.chainMsg1Input.value = dict.presets.mom.c1;
      if (el.chainMsg2Input.value === prevMom.c2) el.chainMsg2Input.value = dict.presets.mom.c2;
      if (el.sosMsgInput.value === prevDict.defaultSosMsg) {
        el.sosMsgInput.value = dict.defaultSosMsg;
      }
    }

    el.toneLabel.textContent = state.mode === "msg" ? dict.toneLabelMsg : dict.toneLabelCall;
    el.testSoundBtn.textContent = state.isTestingSound ? dict.testSoundStop : dict.testSoundPlay;
    el.testVoiceBtn.textContent = state.isTestingVoice ? dict.testVoiceStop : dict.testVoicePlay;
    el.declineLabel.textContent = state.talkInterval ? dict.endCallLabel : dict.declineLabel;
    el.calcDotBtn.textContent = dict.calcDot;

    if (!isStandalone() && !el.installCard.classList.contains("is-hidden")) {
      if (state.detectedOS === "ios") {
        el.installTitle.textContent = dict.installIosTitle;
        el.installDesc.textContent = dict.installIosDesc;
      } else {
        el.installTitle.textContent = dict.installAndroidTitle;
        el.installDesc.textContent = dict.installAndroidDesc;
      }
    }

    applyOSTheme();
    updateCustomAudioUI();
    updateCustomVoiceUI();
    applyWallpaperUI();
    renderModalsContent();
    updateClocks();
    updateCalcUI();
    updateSummaryCard();

    if (persist) savePrefs();
  }

  function applyOSTheme() {
    if (state.osPref === "ios") {
      state.activeOS = "ios";
    } else if (state.osPref === "android") {
      state.activeOS = "android";
    } else {
      state.activeOS = state.detectedOS === "ios" ? "ios" : "android";
    }

    el.appShell.classList.toggle("os-ios", state.activeOS === "ios");
    el.appShell.classList.toggle("os-android", state.activeOS === "android");
    el.detectedOsLabel.textContent = t().osDetected[state.detectedOS];
  }

  // ---------- 2. Bildirim Toast ----------
  let toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.remove("is-hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.add("is-hidden");
    }, 3000);
  }

  // ---------- 3. Ekran Yönetimi ----------
  function showScreen(target) {
    [el.screenSetup, el.screenWait, el.screenCalc, el.screenHome, el.screenCall].forEach((scr) => {
      scr.classList.toggle("is-active", scr === target);
    });
  }

  // ---------- 4. Yerel Tercihler (localStorage) ----------
  function sanitizePhone(raw) {
    return String(raw || "").replace(/[^0-9+\-\s()]/g, "").slice(0, 20);
  }

  function savePrefs() {
    try {
      const data = {
        lang: state.lang,
        mode: state.mode,
        who: el.whoInput.value.slice(0, 40),
        sub: el.subInput.value.slice(0, 28),
        delay: clampInt(el.delayInput.value, 1, 3600, 5),
        msgCount: clampInt(el.msgCountInput.value, 1, 10, 3),
        msgGap: clampInt(el.msgGapInput.value, 1, 60, 3),
        msgText: el.msgTextInput.value.slice(0, 300),
        chainMsg1: el.chainMsg1Input.value.slice(0, 100),
        chainMsg2: el.chainMsg2Input.value.slice(0, 100),
        chainGap: clampInt(el.chainGapInput.value, 2, 60, 6),
        osStyle: state.osPref,
        tone: el.toneSelect.value,
        wpBlurCall: Boolean(el.wpBlurCallToggle && el.wpBlurCallToggle.checked),
        voiceMode: state.voicePref,
        voiceVolume: clampInt(state.voiceVolume, 2, 30, 8),
        sosPhone: sanitizePhone(el.sosPhoneInput.value),
        sosMsg: el.sosMsgInput.value.slice(0, 160)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // yoksay
    }
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!raw) {
        if (state.lang === "en") {
          const d = I18N.en;
          el.whoInput.value = d.presets.mom.who;
          el.subInput.value = d.presets.mom.sub;
          el.msgTextInput.value = d.defaultMsgLines;
          el.chainMsg1Input.value = d.presets.mom.c1;
          el.chainMsg2Input.value = d.presets.mom.c2;
          el.sosMsgInput.value = d.defaultSosMsg;
        }
        return;
      }
      const data = JSON.parse(raw);
      if (data.lang === "tr" || data.lang === "en") state.lang = data.lang;
      if (["call", "msg", "chain"].includes(data.mode)) setMode(data.mode, false);
      if (typeof data.who === "string") el.whoInput.value = data.who.slice(0, 40);
      if (typeof data.sub === "string") el.subInput.value = data.sub.slice(0, 28);
      if (data.delay) {
        el.delayInput.value = String(clampInt(data.delay, 1, 3600, 5));
        syncDelayPills();
      }
      if (data.msgCount) el.msgCountInput.value = String(clampInt(data.msgCount, 1, 10, 3));
      if (data.msgGap) el.msgGapInput.value = String(clampInt(data.msgGap, 1, 60, 3));
      if (typeof data.msgText === "string") el.msgTextInput.value = data.msgText.slice(0, 300);
      if (typeof data.chainMsg1 === "string") el.chainMsg1Input.value = data.chainMsg1.slice(0, 100);
      if (typeof data.chainMsg2 === "string") el.chainMsg2Input.value = data.chainMsg2.slice(0, 100);
      if (data.chainGap) el.chainGapInput.value = String(clampInt(data.chainGap, 2, 60, 6));
      if (["auto", "android", "ios"].includes(data.osStyle)) {
        setOSChoice(data.osStyle, false);
      }
      if (
        ["auto", "ios_melody", "android_melody", "classic", "soft", "custom", "none"].includes(
          data.tone
        )
      ) {
        el.toneSelect.value = data.tone;
      }
      if (typeof data.wpBlurCall === "boolean") {
        el.wpBlurCallToggle.checked = data.wpBlurCall;
      }
      if (data.voiceVolume !== undefined) {
        state.voiceVolume = clampInt(data.voiceVolume, 2, 30, 8);
        el.voiceVolSlider.value = String(state.voiceVolume);
      }
      if (["none", "ambient", "custom_voice"].includes(data.voiceMode)) {
        setVoiceChoice(data.voiceMode, false);
      }
      if (typeof data.sosPhone === "string") {
        el.sosPhoneInput.value = sanitizePhone(data.sosPhone);
      }
      if (typeof data.sosMsg === "string" && data.sosMsg.trim()) {
        el.sosMsgInput.value = data.sosMsg.slice(0, 160);
      }
    } catch {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // yoksay
      }
    }
  }

  // ---------- 5. IndexedDB (Cihaz İçi Medya) ----------
  function openMediaDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB not supported"));
        return;
      }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveMediaItem(key, file) {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put({ blob: file, name: file.name }, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function loadMediaItem(key) {
    try {
      const db = await openMediaDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readonly");
        const req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async function deleteMediaItem(key) {
    try {
      const db = await openMediaDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // yoksay
    }
  }

  async function deleteCustomAudio() {
    if (state.customAudioUrl) {
      URL.revokeObjectURL(state.customAudioUrl);
      state.customAudioUrl = null;
    }
    state.customAudioBlob = null;
    state.customAudioName = "";
    await deleteMediaItem(KEY_AUDIO);
    updateCustomAudioUI();
  }

  async function deleteCustomWallpaper() {
    if (state.wallpaperUrl) {
      URL.revokeObjectURL(state.wallpaperUrl);
      state.wallpaperUrl = null;
    }
    state.wallpaperBlob = null;
    state.wallpaperName = "";
    await deleteMediaItem(KEY_WALLPAPER);
    applyWallpaperUI();
    updateSummaryCard();
  }

  async function deleteCustomVoice() {
    stopCallVoice();
    if (state.customVoiceUrl) {
      URL.revokeObjectURL(state.customVoiceUrl);
      state.customVoiceUrl = null;
    }
    state.customVoiceBlob = null;
    state.customVoiceName = "";
    await deleteMediaItem(KEY_VOICE);
    updateCustomVoiceUI();
  }

  function updateCustomAudioUI() {
    const dict = t();
    const showBox = el.toneSelect.value === "custom";
    el.customAudioBox.classList.toggle("is-hidden", !showBox);

    if (state.customAudioBlob) {
      el.customAudioStatus.textContent = dict.audioActiveStatus.replace("{name}", state.customAudioName);
      el.clearAudioBtn.classList.remove("is-hidden");
    } else {
      el.customAudioStatus.textContent = dict.audioEmptyStatus;
      el.clearAudioBtn.classList.add("is-hidden");
    }
  }

  function updateVoiceVolBadge() {
    const dict = t();
    const v = clampInt(state.voiceVolume, 2, 30, 8);
    const label =
      v <= 10 ? dict.voiceVolWhisperTag : v <= 18 ? dict.voiceVolLowTag : dict.voiceVolMedTag;
    el.voiceVolBadge.textContent = v + "% · " + label;
  }

  function updateCustomVoiceUI() {
    const dict = t();
    const isActive = state.voicePref !== "none";
    el.voiceVolBox.classList.toggle("is-hidden", !isActive);
    el.voiceVolSlider.value = String(clampInt(state.voiceVolume, 2, 30, 8));
    updateVoiceVolBadge();

    const showBox = state.voicePref === "custom_voice";
    el.customVoiceBox.classList.toggle("is-hidden", !showBox);

    if (state.customVoiceBlob) {
      el.customVoiceStatus.textContent = dict.voiceActiveStatus.replace("{name}", state.customVoiceName);
      el.clearVoiceBtn.classList.remove("is-hidden");
    } else {
      el.customVoiceStatus.textContent = dict.voiceEmptyStatus;
      el.clearVoiceBtn.classList.add("is-hidden");
    }
  }

  function applyWallpaperUI() {
    const dict = t();
    const hasWp = Boolean(state.wallpaperBlob);
    const useOnCall = Boolean(el.wpBlurCallToggle && el.wpBlurCallToggle.checked);

    if (hasWp) {
      if (!state.wallpaperUrl) {
        state.wallpaperUrl = URL.createObjectURL(state.wallpaperBlob);
      }
      el.wpThumb.src = state.wallpaperUrl;
      el.wpThumb.classList.remove("is-hidden");
      el.wpPlaceholderIcon.classList.add("is-hidden");
      el.clearWallpaperBtn.classList.remove("is-hidden");
      el.wallpaperStatus.textContent = dict.wpActiveStatus.replace("{name}", state.wallpaperName);

      el.homeBgImg.src = state.wallpaperUrl;
      el.homeBgImg.classList.remove("is-hidden");
      el.homeBgScrim.classList.remove("is-hidden");

      if (useOnCall) {
        el.callBgImg.src = state.wallpaperUrl;
        el.callBgImg.classList.remove("is-hidden");
        el.callBgScrim.classList.remove("is-hidden");
      } else {
        el.callBgImg.removeAttribute("src");
        el.callBgImg.classList.add("is-hidden");
        el.callBgScrim.classList.add("is-hidden");
      }
    } else {
      el.wpThumb.removeAttribute("src");
      el.wpThumb.classList.add("is-hidden");
      el.wpPlaceholderIcon.classList.remove("is-hidden");
      el.clearWallpaperBtn.classList.add("is-hidden");
      el.wallpaperStatus.textContent = dict.wpEmptyStatus;

      el.homeBgImg.removeAttribute("src");
      el.homeBgImg.classList.add("is-hidden");
      el.homeBgScrim.classList.add("is-hidden");
      el.callBgImg.removeAttribute("src");
      el.callBgImg.classList.add("is-hidden");
      el.callBgScrim.classList.add("is-hidden");
    }
  }

  // ---------- 6. Stüdyo DSP Ses Sentezleyici (PCM WAV Blob Motoru) ----------
  function encodeWavBlobUrl(samples, sampleRate) {
    const len = samples.length;
    const buffer = new ArrayBuffer(44 + len * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + len * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, len * 2, true);

    let offset = 44;
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }

  function getSilentWavUrl() {
    if (!state.silentWavUrl) {
      const silent = new Float32Array(8000);
      state.silentWavUrl = encodeWavBlobUrl(silent, 8000);
    }
    return state.silentWavUrl;
  }

  function applyStudioReverb(buf, mix) {
    const n = buf.length;
    const delays = [
      Math.floor(SAMPLE_RATE * 0.0297),
      Math.floor(SAMPLE_RATE * 0.0371),
      Math.floor(SAMPLE_RATE * 0.0411),
      Math.floor(SAMPLE_RATE * 0.0437)
    ];
    const gains = [0.68, 0.64, 0.6, 0.56];
    const wet = new Float32Array(n);

    for (let c = 0; c < delays.length; c++) {
      const d = delays[c];
      const g = gains[c];
      const y = new Float32Array(n);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const prev = i >= d ? y[i - d] : 0;
        lp = lp * 0.36 + prev * 0.64;
        const val = buf[i] + lp * g;
        y[i] = val;
        wet[i] += val * 0.25;
      }
    }

    const out = new Float32Array(n);
    const dry = 1 - mix;
    for (let i = 0; i < n; i++) {
      out[i] = buf[i] * dry + wet[i] * mix;
    }
    return out;
  }

  function masterNormalize(buf, targetPeak) {
    const n = buf.length;
    let peak = 1e-6;
    for (let i = 0; i < n; i++) {
      const a = Math.abs(buf[i]);
      if (a > peak) peak = a;
    }
    const drive = 1.32 / peak;
    const out = new Float32Array(n);
    let peak2 = 1e-6;
    for (let i = 0; i < n; i++) {
      const v = Math.tanh(buf[i] * drive);
      out[i] = v;
      const a = Math.abs(v);
      if (a > peak2) peak2 = a;
    }
    const gain = targetPeak / peak2;
    const fade = Math.min(Math.floor(SAMPLE_RATE * 0.015), Math.floor(n / 2));
    for (let i = 0; i < n; i++) {
      out[i] *= gain;
    }
    for (let i = 0; i < fade; i++) {
      const w = i / fade;
      out[i] *= w;
      out[n - 1 - i] *= w;
    }
    return out;
  }

  function addMarimbaNote(buf, freq, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    const decay = durSec * 0.34;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const env = (1 - Math.exp(-t / 0.0035)) * Math.exp(-t / decay);
      const strike = Math.sin(twoPi * freq * 3.98 * t) * Math.exp(-t / 0.022) * 0.3;
      const shimmer = Math.sin(twoPi * freq * 2.0 * t) * Math.exp(-t / 0.13) * 0.24;
      const body =
        Math.sin(twoPi * freq * t) * 0.72 +
        Math.sin(twoPi * freq * 1.0024 * t) * 0.22;
      buf[idx] += (body + shimmer + strike) * env * amp;
    }
  }

  function addElectricPianoNote(buf, freq, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const env = (1 - Math.exp(-t / 0.006)) * Math.exp(-t / (durSec * 0.48));
      const fmIndex = 1.6 * Math.exp(-t / 0.09);
      const tine = Math.sin(twoPi * freq * t + fmIndex * Math.sin(twoPi * freq * 2.0 * t));
      const warmth = Math.sin(twoPi * freq * 0.5 * t) * 0.14 * Math.exp(-t / 0.25);
      const chorus = Math.sin(twoPi * freq * 1.003 * t) * 0.22;
      buf[idx] += (tine * 0.7 + chorus + warmth) * env * amp;
    }
  }

  function addSoftPad(buf, freqs, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const attack = Math.min(1, t / 0.12);
      const release = Math.max(0, 1 - Math.max(0, t - (durSec - 0.35)) / 0.35);
      const env = attack * release * amp;
      let sum = 0;
      for (let f = 0; f < freqs.length; f++) {
        sum += Math.sin(twoPi * freqs[f] * t);
      }
      buf[idx] += (sum / freqs.length) * env;
    }
  }

  function addHarpPluck(buf, freq, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const env = (1 - Math.exp(-t / 0.0025)) * Math.exp(-t / (durSec * 0.42));
      const h1 = Math.sin(twoPi * freq * t) * 0.65;
      const h2 = Math.sin(twoPi * freq * 2.0 * t) * Math.exp(-t / 0.22) * 0.28;
      const h3 = Math.sin(twoPi * freq * 3.0 * t) * Math.exp(-t / 0.09) * 0.14;
      const h4 = Math.sin(twoPi * freq * 4.01 * t) * Math.exp(-t / 0.04) * 0.07;
      buf[idx] += (h1 + h2 + h3 + h4) * env * amp;
    }
  }

  function addClassicBellBurst(buf, startSec, durSec, amp) {
    const i0 = Math.floor(startSec * SAMPLE_RATE);
    const len = Math.floor(durSec * SAMPLE_RATE);
    const n = buf.length;
    const twoPi = Math.PI * 2;
    const partials = [
      [1180, 0.5],
      [1495, 0.45],
      [2390, 0.28],
      [3120, 0.18],
      [4280, 0.1]
    ];
    for (let k = 0; k < len; k++) {
      const idx = i0 + k;
      if (idx >= n) break;
      const t = k / SAMPLE_RATE;
      const gate =
        Math.min(1, t / 0.015) *
        Math.max(0, 1 - Math.max(0, t - (durSec - 0.05)) / 0.05);
      const clapper = 0.42 + 0.58 * Math.pow(Math.abs(Math.sin(Math.PI * 19 * t)), 0.7);
      let bell = 0;
      for (let p = 0; p < partials.length; p++) {
        bell += Math.sin(twoPi * partials[p][0] * t) * partials[p][1];
      }
      buf[idx] += bell * clapper * gate * amp;
    }
  }

  function buildRingtoneUrl(style) {
    const cacheKey = "ring_" + style;
    if (state.synthCache[cacheKey]) return state.synthCache[cacheKey];

    let buf;
    if (style === "ios_melody") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 3.1));
      addSoftPad(buf, [207.65, 261.63, 311.13], 0.02, 1.0, 0.12);
      addSoftPad(buf, [174.61, 220.0, 261.63], 1.08, 1.15, 0.12);
      const phrase = [
        [523.25, 0.03, 0.52, 0.5],
        [622.25, 0.19, 0.52, 0.54],
        [830.61, 0.35, 0.68, 0.62],
        [698.46, 0.53, 0.56, 0.52],
        [622.25, 0.71, 0.72, 0.48],
        [415.3, 1.08, 0.52, 0.46],
        [523.25, 1.24, 0.54, 0.52],
        [698.46, 1.4, 0.74, 0.6],
        [622.25, 1.59, 0.64, 0.52],
        [523.25, 1.78, 0.92, 0.48]
      ];
      phrase.forEach(([f, s, d, a]) => addMarimbaNote(buf, f, s, d, a));
      buf = applyStudioReverb(buf, 0.3);
    } else if (style === "android_melody") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 3.2));
      addSoftPad(buf, [293.66, 349.23, 440.0, 523.25], 0.02, 1.1, 0.14);
      addSoftPad(buf, [261.63, 329.63, 392.0, 493.88], 1.15, 1.25, 0.14);
      const notes = [
        [587.33, 0.03, 0.6, 0.52],
        [659.25, 0.21, 0.55, 0.5],
        [880.0, 0.39, 0.78, 0.6],
        [783.99, 0.62, 0.62, 0.5],
        [659.25, 0.82, 0.75, 0.46],
        [523.25, 1.16, 0.55, 0.48],
        [659.25, 1.34, 0.58, 0.52],
        [783.99, 1.52, 0.78, 0.58],
        [987.77, 1.74, 0.95, 0.54]
      ];
      notes.forEach(([f, s, d, a]) => addElectricPianoNote(buf, f, s, d, a));
      buf = applyStudioReverb(buf, 0.32);
    } else if (style === "soft") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 3.2));
      const arp = [
        [329.63, 0.04, 0.9, 0.42],
        [392.0, 0.2, 0.9, 0.44],
        [493.88, 0.36, 0.95, 0.48],
        [659.25, 0.52, 1.1, 0.52],
        [587.33, 0.78, 0.9, 0.44],
        [493.88, 0.98, 0.95, 0.42],
        [392.0, 1.34, 0.95, 0.42],
        [493.88, 1.5, 0.95, 0.46],
        [587.33, 1.66, 1.15, 0.5]
      ];
      arp.forEach(([f, s, d, a]) => addHarpPluck(buf, f, s, d, a));
      buf = applyStudioReverb(buf, 0.36);
    } else {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 2.8));
      addClassicBellBurst(buf, 0.05, 0.58, 0.55);
      addClassicBellBurst(buf, 0.78, 0.58, 0.55);
      buf = applyStudioReverb(buf, 0.2);
    }

    const mastered = masterNormalize(buf, 0.88);
    const url = encodeWavBlobUrl(mastered, SAMPLE_RATE);
    state.synthCache[cacheKey] = url;
    return url;
  }

  function buildNotificationUrl(style) {
    const cacheKey = "noti_" + style;
    if (state.synthCache[cacheKey]) return state.synthCache[cacheKey];

    let buf;
    if (style === "ios_melody") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.95));
      addMarimbaNote(buf, 783.99, 0.01, 0.36, 0.52);
      addMarimbaNote(buf, 1046.5, 0.11, 0.42, 0.56);
      addMarimbaNote(buf, 1174.66, 0.22, 0.56, 0.6);
      buf = applyStudioReverb(buf, 0.26);
    } else if (style === "soft") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.75));
      addHarpPluck(buf, 659.25, 0.01, 0.45, 0.48);
      addHarpPluck(buf, 987.77, 0.1, 0.55, 0.52);
      buf = applyStudioReverb(buf, 0.3);
    } else if (style === "classic") {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.75));
      addClassicBellBurst(buf, 0.02, 0.14, 0.5);
      addClassicBellBurst(buf, 0.2, 0.16, 0.5);
      buf = applyStudioReverb(buf, 0.18);
    } else {
      buf = new Float32Array(Math.floor(SAMPLE_RATE * 0.85));
      addElectricPianoNote(buf, 880.0, 0.01, 0.38, 0.52);
      addElectricPianoNote(buf, 1318.51, 0.11, 0.58, 0.58);
      buf = applyStudioReverb(buf, 0.28);
    }

    const mastered = masterNormalize(buf, 0.86);
    const url = encodeWavBlobUrl(mastered, SAMPLE_RATE);
    state.synthCache[cacheKey] = url;
    return url;
  }

  function ensureAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!state.audioCtx) state.audioCtx = new AudioCtx();
      if (state.audioCtx.state === "suspended") {
        state.audioCtx.resume();
      }
      return state.audioCtx;
    } catch {
      return null;
    }
  }

  function resolveToneStyle() {
    const val = el.toneSelect.value;
    if (val === "auto") {
      return state.activeOS === "ios" ? "ios_melody" : "android_melody";
    }
    if (val === "custom" && !state.customAudioBlob) {
      return state.activeOS === "ios" ? "ios_melody" : "android_melody";
    }
    return val;
  }

  function triggerVibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      // yoksay
    }
  }

  function startSilentKeepAlive() {
    try {
      const silentUrl = getSilentWavUrl();
      const player = state.player;
      player.pause();
      player.src = silentUrl;
      player.loop = true;
      player.volume = 0.01;
      player.play().catch(() => {});

      const np = state.notiPlayer;
      np.pause();
      np.src = silentUrl;
      np.loop = false;
      np.volume = 0.01;
      np.play().then(() => np.pause()).catch(() => {});
    } catch {
      // yoksay
    }
  }

  function startRinging() {
    stopRinging();
    const style = resolveToneStyle();

    triggerVibrate([700, 350, 700, 350, 700]);
    state.vibeInterval = setInterval(() => {
      triggerVibrate([700, 350, 700]);
    }, 2600);

    if (style === "none") {
      state.player.pause();
      return;
    }

    let url;
    if (style === "custom" && state.customAudioBlob) {
      if (!state.customAudioUrl) {
        state.customAudioUrl = URL.createObjectURL(state.customAudioBlob);
      }
      url = state.customAudioUrl;
    } else {
      url = buildRingtoneUrl(style);
    }

    const player = state.player;
    player.pause();
    player.src = url;
    player.loop = true;
    player.volume = 1.0;
    player.currentTime = 0;
    player.play().catch(() => {});
  }

  function stopRinging() {
    clearInterval(state.vibeInterval);
    state.vibeInterval = null;
    try {
      state.player.pause();
      state.player.currentTime = 0;
    } catch {
      // yoksay
    }
    triggerVibrate(0);
  }

  function playNotificationSound() {
    const style = resolveToneStyle();
    triggerVibrate([180, 90, 180]);
    if (style === "none") return;

    let url;
    let clipMs = 0;
    if (style === "custom" && state.customAudioBlob) {
      if (!state.customAudioUrl) {
        state.customAudioUrl = URL.createObjectURL(state.customAudioBlob);
      }
      url = state.customAudioUrl;
      clipMs = 2200;
    } else {
      url = buildNotificationUrl(style);
    }

    const p = state.notiPlayer;
    p.pause();
    p.src = url;
    p.loop = false;
    p.volume = 1.0;
    p.currentTime = 0;
    p.play().catch(() => {});
    if (clipMs > 0) {
      state.timers.push(setTimeout(() => p.pause(), clipMs));
    }
  }

  // ---------- 7. Karşı Taraf Sesi Motoru (300–3400 Hz Ahize Filtresi + Fısıltı Modu) ----------
  function computeVoiceGain() {
    if (state.isCallHeld) return 0.0;
    if (state.isCallSpeaker) {
      return state.voicePref === "ambient" ? 0.42 : 0.88;
    }
    const pct = clampInt(state.voiceVolume, 2, 30, 8) / 100;
    // Hoparlör kapalıyken kulağa yaklaştırınca duyulan fısıltı seviyesi
    return state.voicePref === "ambient" ? Math.max(0.012, pct * 0.55) : pct;
  }

  function updateActiveVoiceGain() {
    const target = computeVoiceGain();
    if (state.activeVoiceGain && state.audioCtx) {
      state.activeVoiceGain.gain.setTargetAtTime(target, state.audioCtx.currentTime, 0.04);
    }
    try {
      state.voiceFallbackEl.volume = target;
    } catch {
      // yoksay
    }
  }

  function stopCallVoice() {
    if (state.activeVoiceSource) {
      try {
        state.activeVoiceSource.stop();
        state.activeVoiceSource.disconnect();
      } catch {
        // yoksay
      }
      state.activeVoiceSource = null;
    }
    if (state.activeVoiceGain) {
      try {
        state.activeVoiceGain.disconnect();
      } catch {
        // yoksay
      }
      state.activeVoiceGain = null;
    }
    try {
      state.voiceFallbackEl.pause();
      state.voiceFallbackEl.currentTime = 0;
    } catch {
      // yoksay
    }
  }

  async function startCallVoice(isPreview = false) {
    stopCallVoice();
    const mode = state.voicePref;
    if (mode === "none") return;

    const ctx = ensureAudioContext();

    if (mode === "ambient" || (mode === "custom_voice" && !state.customVoiceBlob)) {
      if (!ctx) return;
      const len = ctx.sampleRate * 3;
      const noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.97 * b0 + white * 0.05;
        b1 = 0.85 * b1 + white * 0.08;
        const swell = 0.78 + 0.22 * Math.sin((2 * Math.PI * i) / len);
        data[i] = (b0 + b1) * 0.55 * swell;
      }

      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 320;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2800;

      const gain = ctx.createGain();
      gain.gain.value = computeVoiceGain();

      src.connect(hp);
      hp.connect(lp);
      lp.connect(gain);
      gain.connect(ctx.destination);
      src.start();

      state.activeVoiceSource = src;
      state.activeVoiceGain = gain;
      return;
    }

    if (ctx && state.customVoiceBlob) {
      try {
        const arrBuf = await state.customVoiceBlob.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrBuf.slice(0));
        const src = ctx.createBufferSource();
        src.buffer = decoded;
        src.loop = true;

        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 340;
        hp.Q.value = 0.9;

        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 3200;
        lp.Q.value = 0.9;

        const midBoost = ctx.createBiquadFilter();
        midBoost.type = "peaking";
        midBoost.frequency.value = 1350;
        midBoost.Q.value = 1.1;
        midBoost.gain.value = 3.5;

        const gain = ctx.createGain();
        gain.gain.value = computeVoiceGain();

        src.connect(hp);
        hp.connect(lp);
        lp.connect(midBoost);
        midBoost.connect(gain);
        gain.connect(ctx.destination);
        src.start();

        state.activeVoiceSource = src;
        state.activeVoiceGain = gain;
        return;
      } catch {
        // fallback
      }
    }

    if (state.customVoiceBlob) {
      if (!state.customVoiceUrl) {
        state.customVoiceUrl = URL.createObjectURL(state.customVoiceBlob);
      }
      state.voiceFallbackEl.src = state.customVoiceUrl;
      state.voiceFallbackEl.loop = true;
      state.voiceFallbackEl.volume = computeVoiceGain();
      state.voiceFallbackEl.play().catch(() => {});
    }
  }

  function playDtmfTone(key) {
    const map = {
      "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
      "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
      "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
      "*": [941, 1209], "0": [941, 1336], "#": [941, 1477]
    };
    const pair = map[key];
    const ctx = ensureAudioContext();
    if (!pair || !ctx) return;
    const t0 = ctx.currentTime;
    pair.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(0.11, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.16);
    });
  }

  // ---------- 8. Sessiz Güvenlik Köprüsü (Acil SMS) ----------
  function triggerSilentSOS() {
    const dict = t();
    const phone = sanitizePhone(el.sosPhoneInput.value).replace(/[\s()-]/g, "");
    if (!phone) {
      showToast(dict.toasts.sosNoPhone);
      return;
    }
    const msg = el.sosMsgInput.value.trim().slice(0, 160) || dict.defaultSosMsg;

    triggerVibrate([60, 40, 60, 40, 120]);
    const sep = state.detectedOS === "ios" ? "&" : "?";
    const uri = "sms:" + phone + sep + "body=" + encodeURIComponent(msg);
    window.location.href = uri;
  }

  // ---------- 9. Wake Lock & Tam Ekran ----------
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        state.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch {
      // yoksay
    }
  }

  async function releaseWakeLock() {
    try {
      if (state.wakeLock) {
        await state.wakeLock.release();
        state.wakeLock = null;
      }
    } catch {
      // yoksay
    }
  }

  function enterFullscreenIfMobile() {
    if (window.innerWidth > 860) return;
    try {
      const root = document.documentElement;
      if (root.requestFullscreen && !document.fullscreenElement) {
        root.requestFullscreen().catch(() => {});
      }
    } catch {
      // yoksay
    }
  }

  function exitFullscreenSafe() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // yoksay
    }
  }

  // ---------- 10. Zamanlayıcı & Simülasyon Akışı ----------
  function clearAllTimers() {
    state.isWaiting = false;
    state.waitingInDisguise = false;
    state.targetEndTime = 0;
    state.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    state.timers = [];
    clearInterval(state.talkInterval);
    state.talkInterval = null;
    stopRinging();
    stopCallVoice();
    releaseWakeLock();
    el.screenWait.classList.remove("is-stealth");
    el.calcArmedDot.classList.add("is-hidden");
  }

  function clampInt(val, min, max, fallback) {
    const n = parseInt(String(val), 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function syncDelayPills() {
    const val = el.delayInput.value;
    el.quickDelays.querySelectorAll(".mini-pill").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.sec === val);
    });
  }

  function formatClock(date) {
    return date.toLocaleTimeString(t().locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  }

  function formatDate(date) {
    return date.toLocaleDateString(t().locale, {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  function updateClocks() {
    const now = new Date();
    const timeStr = formatClock(now);
    el.lockClock.textContent = timeStr;
    el.sbTimeHome.textContent = timeStr;
    el.sbTimeCall.textContent = timeStr;
    el.lockDate.textContent = formatDate(now);
  }

  function prewarmAudioForMode() {
    const resolved = resolveToneStyle();
    if (resolved !== "none" && resolved !== "custom") {
      if (state.mode === "call" || state.mode === "chain") {
        buildRingtoneUrl(resolved);
      }
      if (state.mode === "msg" || state.mode === "chain") {
        buildNotificationUrl(resolved);
      }
    }
  }

  function triggerScheduledEvent() {
    if (!state.isWaiting) return;
    state.isWaiting = false;
    state.waitingInDisguise = false;
    state.targetEndTime = 0;
    el.calcArmedDot.classList.add("is-hidden");

    state.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    state.timers = [];
    el.screenWait.classList.remove("is-stealth");

    if (state.mode === "call") {
      launchIncomingCall();
    } else if (state.mode === "msg") {
      launchMessages();
    } else {
      launchEscalatingChain();
    }
  }

  function checkCountdownProgress() {
    if (!state.isWaiting) return;
    const msLeft = state.targetEndTime - Date.now();
    if (msLeft <= 0) {
      el.waitTimer.textContent = "0";
      triggerScheduledEvent();
    } else {
      el.waitTimer.textContent = String(Math.ceil(msLeft / 1000));
    }
  }

  function startSimulation(overrideDelaySec = null, inDisguise = false) {
    stopTestSound();
    stopTestVoice();
    clearAllTimers();
    savePrefs();
    applyOSTheme();
    applyWallpaperUI();
    prewarmAudioForMode();

    startSilentKeepAlive();
    ensureAudioContext();

    const delaySec =
      overrideDelaySec !== null
        ? clampInt(overrideDelaySec, 1, 3600, 5)
        : clampInt(el.delayInput.value, 1, 3600, 5);

    if (overrideDelaySec === null) {
      el.delayInput.value = String(delaySec);
      syncDelayPills();
    }

    state.isWaiting = true;
    state.waitingInDisguise = inDisguise;
    state.targetEndTime = Date.now() + delaySec * 1000;

    requestWakeLock();

    if (inDisguise) {
      el.calcArmedDot.classList.remove("is-hidden");
    } else {
      el.waitTimer.textContent = String(delaySec);
      el.screenWait.classList.remove("is-stealth");
      showScreen(el.screenWait);
      enterFullscreenIfMobile();

      if (delaySec >= 3) {
        state.timers.push(
          setTimeout(() => {
            if (state.isWaiting) el.screenWait.classList.add("is-stealth");
          }, 2000)
        );
      }
    }

    const tick = setInterval(checkCountdownProgress, 250);
    state.timers.push(tick);
  }

  function launchIncomingCall() {
    const dict = t();
    const caller = el.whoInput.value.trim().slice(0, 40) || dict.unknownCaller;
    const sub = el.subInput.value.trim().slice(0, 28) || dict.presets.mom.sub;

    state.isCallMuted = false;
    state.isCallHeld = false;
    state.isCallSpeaker = false;

    el.callName.textContent = caller;
    el.callInitial.textContent = caller.charAt(0).toUpperCase() || "?";
    el.callSub.textContent = sub + dict.callingSuffix;

    el.callRipple.classList.remove("is-paused");
    el.callRipple2.classList.remove("is-paused");
    el.callPreActions.classList.remove("is-hidden");
    el.inCallGrid.classList.add("is-hidden");
    el.dtmfPad.classList.add("is-hidden");
    el.dtmfDisplay.textContent = "";
    el.acceptWrap.classList.remove("is-hidden");
    el.callActions.classList.remove("is-single");
    el.declineLabel.textContent = dict.declineLabel;

    el.inCallGrid.querySelectorAll(".call-tool-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
    });

    showScreen(el.screenCall);
    startRinging();
  }

  function answerCall() {
    stopRinging();
    el.callRipple.classList.add("is-paused");
    el.callRipple2.classList.add("is-paused");
    el.callPreActions.classList.add("is-hidden");
    el.acceptWrap.classList.add("is-hidden");
    el.callActions.classList.add("is-single");
    el.declineLabel.textContent = t().endCallLabel;
    el.inCallGrid.classList.remove("is-hidden");

    startCallVoice(false);

    let elapsed = 0;
    el.callSub.textContent = "00:00";
    state.talkInterval = setInterval(() => {
      elapsed += 1;
      const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const secs = String(elapsed % 60).padStart(2, "0");
      el.callSub.textContent = state.isCallHeld ? t().onHoldPrefix + mins + ":" + secs : mins + ":" + secs;
    }, 1000);
  }

  function createNotificationNode(sender, text, timeStr) {
    const card = document.createElement("article");
    card.className = "noti-card";

    const top = document.createElement("div");
    top.className = "noti-top";

    const senderWrap = document.createElement("div");
    senderWrap.className = "noti-sender-wrap";

    const badge = document.createElement("span");
    badge.className = "noti-badge";
    badge.textContent = sender.charAt(0).toUpperCase() || "M";

    const senderEl = document.createElement("span");
    senderEl.className = "noti-sender";
    senderEl.textContent = sender;

    const timeEl = document.createElement("span");
    timeEl.className = "noti-time";
    timeEl.textContent = timeStr;

    const body = document.createElement("p");
    body.className = "noti-body";
    body.textContent = text;

    senderWrap.appendChild(badge);
    senderWrap.appendChild(senderEl);
    top.appendChild(senderWrap);
    top.appendChild(timeEl);
    card.appendChild(top);
    card.appendChild(body);
    return card;
  }

  function launchMessages() {
    const dict = t();
    state.player.pause();
    updateClocks();
    el.notiStack.replaceChildren();
    showScreen(el.screenHome);

    const count = clampInt(el.msgCountInput.value, 1, 10, 3);
    const gap = clampInt(el.msgGapInput.value, 1, 60, 3);
    const sender = el.whoInput.value.trim().slice(0, 40) || dict.unknownCaller;

    const customLines = el.msgTextInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    for (let i = 0; i < count; i++) {
      const text = customLines[i] || dict.fallbackMsgs[i % dict.fallbackMsgs.length];

      const tId = setTimeout(() => {
        const node = createNotificationNode(sender, text, formatClock(new Date()));
        el.notiStack.prepend(node);
        playNotificationSound();
      }, i * gap * 1000);
      state.timers.push(tId);
    }
  }

  function launchEscalatingChain() {
    const dict = t();
    updateClocks();
    el.notiStack.replaceChildren();
    showScreen(el.screenHome);

    const sender = el.whoInput.value.trim().slice(0, 40) || dict.presets.mom.who;
    const msg1 = el.chainMsg1Input.value.trim().slice(0, 100) || dict.presets.mom.c1;
    const msg2 = el.chainMsg2Input.value.trim().slice(0, 100) || dict.presets.mom.c2;
    const gap = clampInt(el.chainGapInput.value, 2, 60, 6);

    el.notiStack.prepend(createNotificationNode(sender, msg1, formatClock(new Date())));
    playNotificationSound();

    state.timers.push(
      setTimeout(() => {
        el.notiStack.prepend(createNotificationNode(sender, msg2, formatClock(new Date())));
        playNotificationSound();
      }, gap * 1000)
    );

    state.timers.push(
      setTimeout(() => {
        launchIncomingCall();
      }, gap * 2 * 1000)
    );
  }

  function returnToSetup() {
    clearAllTimers();
    exitFullscreenSafe();
    el.declineLabel.textContent = t().declineLabel;
    showScreen(el.screenSetup);
  }

  // ---------- 11. Kamufle Mod: Gerçek Çalışan Hesap Makinesi (eval yok) ----------
  function formatCalcNumber(num) {
    if (!Number.isFinite(num)) return t().calcError;
    const str = String(Number(num.toPrecision(10)));
    return str.replace(".", t().calcDot);
  }

  function updateCalcUI() {
    const dot = t().calcDot;
    const text = state.calc.current === "Error" ? t().calcError : state.calc.current.replace(".", dot);
    el.calcDisplay.textContent = text;
    el.calcDisplay.classList.toggle("is-small", text.length > 8);
    if (state.calc.prev !== null && state.calc.op) {
      const symMap = { "/": "÷", "*": "×", "-": "−", "+": "+" };
      el.calcExpr.textContent = formatCalcNumber(state.calc.prev) + " " + (symMap[state.calc.op] || "");
    } else {
      el.calcExpr.textContent = "";
    }
  }

  function computeCalc(a, b, op) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "*") return a * b;
    if (op === "/") return b === 0 ? NaN : a / b;
    return b;
  }

  function resetCalcState() {
    state.calc.current = "0";
    state.calc.prev = null;
    state.calc.op = null;
    state.calc.resetNext = false;
    updateCalcUI();
  }

  function openCalculatorDisguise() {
    stopTestSound();
    stopTestVoice();
    savePrefs();
    applyOSTheme();
    resetCalcState();
    showScreen(el.screenCalc);
    enterFullscreenIfMobile();
    showToast(t().toasts.calcOpened);
  }

  function handleCalcKey(btn) {
    const num = btn.dataset.num;
    const op = btn.dataset.op;
    const act = btn.dataset.act;

    if (num !== undefined) {
      if (state.calc.resetNext || state.calc.current === "0" || state.calc.current === "Error") {
        state.calc.current = num;
        state.calc.resetNext = false;
      } else if (state.calc.current.length < 11) {
        state.calc.current += num;
      }
      updateCalcUI();
      return;
    }

    if (act === "dot") {
      if (state.calc.resetNext || state.calc.current === "Error") {
        state.calc.current = "0.";
        state.calc.resetNext = false;
      } else if (!state.calc.current.includes(".")) {
        state.calc.current += ".";
      }
      updateCalcUI();
      return;
    }

    if (act === "clear") {
      const now = Date.now();
      if (state.isWaiting && now - state.calc.lastAcTap < 420) {
        clearAllTimers();
        showToast(t().toasts.calcCanceled);
      }
      state.calc.lastAcTap = now;
      resetCalcState();
      return;
    }

    if (act === "sign") {
      const val = parseFloat(state.calc.current);
      if (!Number.isNaN(val) && val !== 0) {
        state.calc.current = String(-val);
        updateCalcUI();
      }
      return;
    }

    if (act === "percent") {
      const val = parseFloat(state.calc.current);
      if (!Number.isNaN(val)) {
        state.calc.current = String(val / 100);
        updateCalcUI();
      }
      return;
    }

    if (op) {
      const val = parseFloat(state.calc.current);
      if (Number.isNaN(val)) return;
      if (state.calc.prev !== null && state.calc.op && !state.calc.resetNext) {
        const res = computeCalc(state.calc.prev, val, state.calc.op);
        state.calc.prev = res;
        state.calc.current = Number.isFinite(res) ? String(Number(res.toPrecision(10))) : "Error";
      } else {
        state.calc.prev = val;
      }
      state.calc.op = op;
      state.calc.resetNext = true;
      updateCalcUI();
      return;
    }

    if (act === "equals") {
      const val = parseFloat(state.calc.current);
      if (Number.isNaN(val)) return;

      if (state.calc.prev !== null && state.calc.op) {
        const res = computeCalc(state.calc.prev, val, state.calc.op);
        state.calc.current = Number.isFinite(res) ? String(Number(res.toPrecision(10))) : "Error";
        state.calc.prev = null;
        state.calc.op = null;
        state.calc.resetNext = true;
        updateCalcUI();
        return;
      }

      if (val >= 1 && val <= 3600) {
        const secs = Math.round(val);
        state.calc.resetNext = true;
        startSimulation(secs, true);
      }
    }
  }

  // ---------- 12. Ses & Konuşma Testleri ----------
  function stopTestSound() {
    if (!state.isTestingSound) return;
    stopRinging();
    try {
      state.notiPlayer.pause();
      state.notiPlayer.currentTime = 0;
    } catch {
      // yoksay
    }
    state.isTestingSound = false;
    el.testSoundBtn.textContent = t().testSoundPlay;
  }

  function toggleTestSound() {
    if (state.isTestingSound) {
      stopTestSound();
      return;
    }
    stopTestVoice();
    state.isTestingSound = true;
    el.testSoundBtn.textContent = t().testSoundStop;

    if (state.mode === "msg") {
      playNotificationSound();
      state.timers.push(setTimeout(stopTestSound, 1100));
    } else {
      startRinging();
      state.timers.push(setTimeout(stopTestSound, 3200));
    }
  }

  function stopTestVoice() {
    if (!state.isTestingVoice) return;
    stopCallVoice();
    state.isTestingVoice = false;
    el.testVoiceBtn.textContent = t().testVoicePlay;
  }

  function toggleTestVoice() {
    if (state.isTestingVoice) {
      stopTestVoice();
      return;
    }
    if (state.voicePref === "none") {
      showToast(t().toasts.selectVoiceFirst);
      return;
    }
    stopTestSound();
    state.isTestingVoice = true;
    el.testVoiceBtn.textContent = t().testVoiceStop;
    startCallVoice(true);
    state.timers.push(setTimeout(stopTestVoice, 5000));
  }

  // ---------- 13. Pano Kopyalama ----------
  async function copyTextSafe(text) {
    const dict = t();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(dict.toasts.copied + text);
        return;
      }
    } catch {
      // fallback
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "sr-only";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(dict.toasts.copiedShort);
    } catch {
      showToast(dict.toasts.copyFailed);
    }
    document.body.removeChild(ta);
  }

  // ---------- 14. Mod, PWA & Modallar ----------
  function setMode(mode, persist = true) {
    state.mode = mode;

    [
      [el.tabCall, "call"],
      [el.tabMsg, "msg"],
      [el.tabChain, "chain"]
    ].forEach(([tab, key]) => {
      const active = mode === key;
      tab.classList.toggle("is-selected", active);
      tab.setAttribute("aria-selected", String(active));
    });

    el.msgOptions.classList.toggle("is-hidden", mode !== "msg");
    el.chainOptions.classList.toggle("is-hidden", mode !== "chain");
    el.toneLabel.textContent = mode === "msg" ? t().toneLabelMsg : t().toneLabelCall;
    stopTestSound();
    updateSummaryCard();
    if (persist) savePrefs();
  }

  function setupPWAInstall() {
    if (isStandalone()) return;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredPrompt = e;
      el.installTitle.textContent = t().installAndroidTitle;
      el.installDesc.textContent = t().installAndroidDesc;
      el.installActionBtn.classList.remove("is-hidden");
      el.installCard.classList.remove("is-hidden");
    });

    window.addEventListener("appinstalled", () => {
      state.deferredPrompt = null;
      el.installCard.classList.add("is-hidden");
      showToast(t().toasts.installed);
    });

    if (state.detectedOS === "ios") {
      el.installTitle.textContent = t().installIosTitle;
      el.installDesc.textContent = t().installIosDesc;
      el.installActionBtn.classList.add("is-hidden");
      el.installCard.classList.remove("is-hidden");
    }

    el.installActionBtn.addEventListener("click", async () => {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      el.installCard.classList.add("is-hidden");
    });

    el.dismissInstallBtn.addEventListener("click", () => {
      el.installCard.classList.add("is-hidden");
    });
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then(() => {
            if (el.offlineStatusDesktop) {
              el.offlineStatusDesktop.textContent = t().offlineActive;
            }
          })
          .catch(() => {});
      });
    }
  }

  function openTipsModal() {
    el.tipsModal.classList.remove("is-hidden");
  }

  function closeTipsModal() {
    el.tipsModal.classList.add("is-hidden");
  }

  function openLegalModal() {
    el.legalModal.classList.remove("is-hidden");
  }

  function closeLegalModal() {
    el.legalModal.classList.add("is-hidden");
  }

  async function wipeAllLocalData() {
    const dict = t();
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // yoksay
    }
    await Promise.all([deleteCustomAudio(), deleteCustomWallpaper(), deleteCustomVoice()]);
    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // yoksay
      }
    }
    el.whoInput.value = dict.presets.mom.who;
    el.subInput.value = dict.presets.mom.sub;
    el.delayInput.value = "5";
    syncDelayPills();
    el.msgTextInput.value = dict.defaultMsgLines;
    el.chainMsg1Input.value = dict.presets.mom.c1;
    el.chainMsg2Input.value = dict.presets.mom.c2;
    el.toneSelect.value = "auto";
    el.sosPhoneInput.value = "";
    el.sosMsgInput.value = dict.defaultSosMsg;
    el.wpBlurCallToggle.checked = true;
    setOSChoice("auto", false);
    state.voiceVolume = 8;
    el.voiceVolSlider.value = "8";
    setVoiceChoice("none", false);
    setMode("call", false);
    updateCustomAudioUI();
    applyWallpaperUI();
    updateSummaryCard();
    closeLegalModal();
    showToast(dict.toasts.wiped);
  }

  // ---------- 15. Olay Dinleyicileri ----------
  function bindEvents() {
    el.langTrBtn.addEventListener("click", () => applyLanguage("tr", true, true));
    el.langEnBtn.addEventListener("click", () => applyLanguage("en", true, true));

    el.navTabScenario.addEventListener("click", () => setSetupTab("scenario"));
    el.navTabStyle.addEventListener("click", () => setSetupTab("style"));
    el.navTabSafety.addEventListener("click", () => setSetupTab("safety"));

    el.tabCall.addEventListener("click", () => setMode("call"));
    el.tabMsg.addEventListener("click", () => setMode("msg"));
    el.tabChain.addEventListener("click", () => setMode("chain"));

    el.openCalcBtn.addEventListener("click", openCalculatorDisguise);
    el.openCalcCardBtn.addEventListener("click", openCalculatorDisguise);

    el.presetRow.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const key = chip.dataset.preset;
      const preset = t().presets[key];
      if (!preset) return;

      el.presetRow.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      el.whoInput.value = preset.who;
      el.subInput.value = preset.sub;
      el.msgTextInput.value = preset.msg + "\n" + t().fallbackMsgs[2];
      el.chainMsg1Input.value = preset.c1;
      el.chainMsg2Input.value = preset.c2;
      updateSummaryCard();
      savePrefs();
    });

    // Stepper -/+ ve hızlı süre hapları
    el.delayMinusBtn.addEventListener("click", () => {
      const cur = clampInt(el.delayInput.value, 1, 3600, 5);
      const next = cur <= 5 ? Math.max(1, cur - 1) : Math.max(1, cur - 5);
      el.delayInput.value = String(next);
      syncDelayPills();
      updateSummaryCard();
      savePrefs();
    });

    el.delayPlusBtn.addEventListener("click", () => {
      const cur = clampInt(el.delayInput.value, 1, 3600, 5);
      const next = cur < 5 ? cur + 1 : Math.min(3600, cur + 5);
      el.delayInput.value = String(next);
      syncDelayPills();
      updateSummaryCard();
      savePrefs();
    });

    el.quickDelays.addEventListener("click", (e) => {
      const btn = e.target.closest(".mini-pill");
      if (!btn) return;
      el.delayInput.value = btn.dataset.sec || "5";
      syncDelayPills();
      updateSummaryCard();
      savePrefs();
    });

    el.delayInput.addEventListener("input", () => {
      syncDelayPills();
      updateSummaryCard();
      savePrefs();
    });

    [el.whoInput, el.subInput, el.sosPhoneInput].forEach((inp) => {
      inp.addEventListener("input", updateSummaryCard);
      inp.addEventListener("change", savePrefs);
    });

    [
      el.msgCountInput,
      el.msgGapInput,
      el.msgTextInput,
      el.chainMsg1Input,
      el.chainMsg2Input,
      el.chainGapInput,
      el.sosMsgInput
    ].forEach((inp) => {
      inp.addEventListener("change", savePrefs);
    });

    // Görsel OS Stili kart seçici
    el.osChoiceGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".choice-card");
      if (!card || !card.dataset.os) return;
      setOSChoice(card.dataset.os, true);
    });

    // Görsel Karşı Taraf Sesi kart seçici
    el.voiceChoiceGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".choice-card");
      if (!card || !card.dataset.voice) return;
      setVoiceChoice(card.dataset.voice, true);
    });

    // Duvar kağıdı seçme / silme
    el.wallpaperInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !file.type.startsWith("image/")) {
        showToast(t().toasts.invalidImg);
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
        showToast(t().toasts.fileTooBig);
        return;
      }

      if (state.wallpaperUrl) {
        URL.revokeObjectURL(state.wallpaperUrl);
        state.wallpaperUrl = null;
      }
      state.wallpaperBlob = file;
      state.wallpaperName = file.name.slice(0, 60);

      try {
        await saveMediaItem(KEY_WALLPAPER, file);
        showToast(t().toasts.wpSaved);
      } catch {
        showToast(t().toasts.wpSession);
      }
      applyWallpaperUI();
      updateSummaryCard();
    });

    el.clearWallpaperBtn.addEventListener("click", async () => {
      await deleteCustomWallpaper();
      showToast(t().toasts.wpRemoved);
    });

    el.wpBlurCallToggle.addEventListener("change", () => {
      applyWallpaperUI();
      savePrefs();
    });

    // Zil sesi seçme / test / özel ses
    el.toneSelect.addEventListener("change", () => {
      stopTestSound();
      updateCustomAudioUI();
      updateSummaryCard();
      savePrefs();
    });

    el.testSoundBtn.addEventListener("click", toggleTestSound);

    el.customAudioInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !file.type.startsWith("audio/")) {
        showToast(t().toasts.invalidAudio);
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
        showToast(t().toasts.fileTooBig);
        return;
      }

      if (state.customAudioUrl) {
        URL.revokeObjectURL(state.customAudioUrl);
        state.customAudioUrl = null;
      }
      state.customAudioBlob = file;
      state.customAudioName = file.name.slice(0, 60);

      try {
        await saveMediaItem(KEY_AUDIO, file);
        showToast(t().toasts.audioSaved);
      } catch {
        showToast(t().toasts.audioSession);
      }
      updateCustomAudioUI();
    });

    el.clearAudioBtn.addEventListener("click", async () => {
      stopTestSound();
      await deleteCustomAudio();
      showToast(t().toasts.audioRemoved);
    });

    // Karşı taraf sesi test / fısıltı seviyesi / yükleme
    el.testVoiceBtn.addEventListener("click", toggleTestVoice);

    el.voiceVolSlider.addEventListener("input", () => {
      state.voiceVolume = clampInt(el.voiceVolSlider.value, 2, 30, 8);
      updateVoiceVolBadge();
      updateActiveVoiceGain();
    });

    el.voiceVolSlider.addEventListener("change", () => {
      state.voiceVolume = clampInt(el.voiceVolSlider.value, 2, 30, 8);
      updateVoiceVolBadge();
      updateActiveVoiceGain();
      savePrefs();
    });

    el.customVoiceInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type || !file.type.startsWith("audio/")) {
        showToast(t().toasts.invalidAudio);
        return;
      }
      if (file.size > MAX_MEDIA_BYTES) {
        showToast(t().toasts.fileTooBig);
        return;
      }

      if (state.customVoiceUrl) {
        URL.revokeObjectURL(state.customVoiceUrl);
        state.customVoiceUrl = null;
      }
      state.customVoiceBlob = file;
      state.customVoiceName = file.name.slice(0, 60);

      try {
        await saveMediaItem(KEY_VOICE, file);
        showToast(t().toasts.voiceSaved);
      } catch {
        showToast(t().toasts.voiceSession);
      }
      updateCustomVoiceUI();
    });

    el.clearVoiceBtn.addEventListener("click", async () => {
      stopTestVoice();
      await deleteCustomVoice();
      showToast(t().toasts.voiceRemoved);
    });

    // Hesap makinesi tuşları + AC basılı tutarak çıkış
    el.calcGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".calc-key");
      if (!btn) return;
      handleCalcKey(btn);
    });

    const startAcHold = () => {
      clearTimeout(state.calc.acHoldTimer);
      state.calc.acHoldTimer = setTimeout(() => {
        triggerVibrate(40);
        returnToSetup();
      }, 1300);
    };
    const cancelAcHold = () => {
      clearTimeout(state.calc.acHoldTimer);
    };

    el.calcClearBtn.addEventListener("pointerdown", startAcHold);
    el.calcClearBtn.addEventListener("pointerup", cancelAcHold);
    el.calcClearBtn.addEventListener("pointerleave", cancelAcHold);
    el.calcClearBtn.addEventListener("pointercancel", cancelAcHold);

    // Simülasyon başlat / iptal
    el.startBtn.addEventListener("click", () => startSimulation(null, false));
    el.cancelWaitBtn.addEventListener("click", returnToSetup);

    el.screenWait.addEventListener("click", (e) => {
      if (e.target === el.cancelWaitBtn) return;
      const now = Date.now();
      if (now - state.lastTapTime < 380) {
        returnToSetup();
      }
      state.lastTapTime = now;
    });

    el.acceptBtn.addEventListener("click", answerCall);
    el.declineBtn.addEventListener("click", returnToSetup);
    el.homeBackBtn.addEventListener("click", returnToSetup);

    // Beklet tuşuna 2.5 sn basılı tutunca Sessiz SOS
    const startSosHold = () => {
      state.sosTriggered = false;
      clearTimeout(state.sosHoldTimer);
      if (!sanitizePhone(el.sosPhoneInput.value).trim()) return;
      el.holdToolBtn.classList.add("is-sos-holding");
      state.sosHoldTimer = setTimeout(() => {
        state.sosTriggered = true;
        el.holdToolBtn.classList.remove("is-sos-holding");
        triggerSilentSOS();
      }, 2500);
    };
    const cancelSosHold = () => {
      clearTimeout(state.sosHoldTimer);
      el.holdToolBtn.classList.remove("is-sos-holding");
    };

    el.holdToolBtn.addEventListener("pointerdown", startSosHold);
    el.holdToolBtn.addEventListener("pointerup", cancelSosHold);
    el.holdToolBtn.addEventListener("pointerleave", cancelSosHold);
    el.holdToolBtn.addEventListener("pointercancel", cancelSosHold);

    el.inCallGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".call-tool-btn");
      if (!btn) return;
      const tool = btn.dataset.tool;
      if (tool === "hold" && state.sosTriggered) {
        state.sosTriggered = false;
        return;
      }
      if (tool === "keypad") {
        el.inCallGrid.classList.add("is-hidden");
        el.dtmfPad.classList.remove("is-hidden");
        return;
      }
      const next = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(next));

      if (tool === "mute") {
        state.isCallMuted = next;
      } else if (tool === "hold") {
        state.isCallHeld = next;
        updateActiveVoiceGain();
      } else if (tool === "speaker") {
        state.isCallSpeaker = next;
        updateActiveVoiceGain();
      }
    });

    el.dtmfKeys.addEventListener("click", (e) => {
      const keyBtn = e.target.closest(".dtmf-key");
      if (!keyBtn) return;
      const k = keyBtn.dataset.k || "";
      playDtmfTone(k);
      if (el.dtmfDisplay.textContent.length < 16) {
        el.dtmfDisplay.textContent += k;
      }
    });

    el.hideDtmfBtn.addEventListener("click", () => {
      el.dtmfPad.classList.add("is-hidden");
      el.inCallGrid.classList.remove("is-hidden");
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && state.isWaiting) {
        requestWakeLock();
        checkCountdownProgress();
      }
    });

    // Tüyolar Modalı
    [
      el.openTipsBanner,
      el.openTipsDesktop,
      el.openWallpaperTipBtn,
      el.openRingtoneGuideBtn
    ].forEach((btn) => {
      if (btn) btn.addEventListener("click", openTipsModal);
    });
    el.closeTipsBtn.addEventListener("click", closeTipsModal);
    el.acceptTipsBtn.addEventListener("click", closeTipsModal);
    el.tipsModal.addEventListener("click", (e) => {
      if (e.target === el.tipsModal) closeTipsModal();
    });

    el.tipsModalBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-pill");
      if (!btn || !btn.dataset.copy) return;
      copyTextSafe(btn.dataset.copy);
    });

    // KVKK / Privacy Modalı
    [el.openLegalBtn, el.openLegalInline, el.openLegalDesktop].forEach((btn) => {
      if (btn) btn.addEventListener("click", openLegalModal);
    });
    el.closeLegalBtn.addEventListener("click", closeLegalModal);
    el.acceptLegalBtn.addEventListener("click", closeLegalModal);
    el.wipeDataBtn.addEventListener("click", wipeAllLocalData);
    el.legalModal.addEventListener("click", (e) => {
      if (e.target === el.legalModal) closeLegalModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!el.tipsModal.classList.contains("is-hidden")) closeTipsModal();
        if (!el.legalModal.classList.contains("is-hidden")) closeLegalModal();
      }
    });
  }

  // ---------- 16. Başlatma ----------
  async function init() {
    loadPrefs();
    applyLanguage(state.lang, false, false);
    setInterval(updateClocks, 1000);

    const [savedAudio, savedWp, savedVoice] = await Promise.all([
      loadMediaItem(KEY_AUDIO),
      loadMediaItem(KEY_WALLPAPER),
      loadMediaItem(KEY_VOICE)
    ]);

    if (savedAudio && savedAudio.blob) {
      state.customAudioBlob = savedAudio.blob;
      state.customAudioName = savedAudio.name || "Custom Audio";
    }
    if (savedWp && savedWp.blob) {
      state.wallpaperBlob = savedWp.blob;
      state.wallpaperName = savedWp.name || "Wallpaper";
    }
    if (savedVoice && savedVoice.blob) {
      state.customVoiceBlob = savedVoice.blob;
      state.customVoiceName = savedVoice.name || "Voice Clip";
    }

    updateCustomAudioUI();
    updateCustomVoiceUI();
    applyWallpaperUI();
    updateSummaryCard();

    bindEvents();
    setupPWAInstall();
    registerServiceWorker();
  }

  init();
})();
