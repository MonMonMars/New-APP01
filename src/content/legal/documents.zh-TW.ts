import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { LegalDocument, LegalDocumentId } from './types';

export const LEGAL_CONTACT_EMAIL = LEGAL_ENTITY.legalEmail;
export const LEGAL_PRIVACY_EMAIL = LEGAL_ENTITY.privacyEmail;

export function buildZhTwDocuments(effective: string): Record<LegalDocumentId, LegalDocument> {
  return {
    terms: {
      id: 'terms',
      title: '使用者條款',
      effective,
      intro: `本條款規範您對 Spark 及 Pulse 偽裝模式之使用，服務由 ${LEGAL_ENTITY.name} 營運。建立帳戶即表示您同意本條款、我們的隱私政策、社群規範及相關政策。`,
      sections: [
        {
          id: 'agreement',
          title: '協議',
          body:
            '建立帳戶、存取或使用 Spark，即表示您同意本條款、隱私政策、社群規範、偽裝模式政策、信任與驗證政策、訂閱條款及安全聲明。若您不同意，請勿使用本服務。',
        },
        {
          id: 'eligibility',
          title: '使用資格',
          body:
            '您須年滿 18 歲（或您所在司法管轄區之法定成年年齡，以較高者為準）。一人僅能持有一個帳戶。您不得因適用法律禁止或曾遭封禁而使用本服務。提供虛假年齡資訊將導致帳戶立即終止。',
        },
        {
          id: 'account',
          title: '帳戶註冊',
          body:
            '您須對登入憑證及帳戶下之所有活動負責。請提供正確資訊並保持個人檔案更新。您不得分享、出售或轉讓帳戶。',
        },
        {
          id: 'service',
          title: 'Spark 提供之服務',
          body:
            'Spark 為社交探索與約會平台。我們不保證配對、約會、關係、相容性，或任何會員之身份、意圖或安全。驗證徽章並非背景調查。Pulse 偽裝模式為選用之隱私功能——詳見偽裝模式政策。',
        },
        {
          id: 'conduct',
          title: '您的內容與行為',
          body:
            '您保留對照片及訊息之所有權。您授予 Spark 授權以託管及顯示上述內容，以便營運本服務。禁止騷擾、詐欺、冒充他人、垃圾訊息、非法內容、爬蟲抓取，或使用偽裝模式以規避執法機關。詳見社群規範。',
        },
        {
          id: 'moderation',
          title: '內容審核與執行',
          body:
            '我們得移除內容、暫停或終止帳戶、通報非法活動，並與執法機關合作。我們無義務監控所有內容，但得為之。',
        },
        {
          id: 'payments',
          title: '訂閱與購買',
          body:
            'Spark+ 及應用程式內購買透過 Apple App Store 或 Google Play 計費。訂閱將自動續訂，直至您在商店設定中取消為止。帳單、退款及取消詳情請見訂閱條款。',
        },
        {
          id: 'third-party',
          title: '第三方內容',
          body:
            'Pulse 可能顯示範例新聞標題、文章摘要或贊助風格內容以供示意。我們不控制第三方網站，且除非明確聲明，否則與示意之出版商無關聯。',
        },
        {
          id: 'ip',
          title: '智慧財產權',
          body:
            'Spark、Pulse、標誌及服務設計為我們或授權方之財產。未經書面許可，您不得複製、修改或散布。',
        },
        {
          id: 'disclaimer',
          title: '免責聲明與責任限制',
          body:
            '本服務依「現狀」及「現有可用性」提供。約會涉及現實世界風險——您須對面對面互動自行負責。我們之責任在法律允許之最大範圍內予以限制。詳見安全聲明。',
        },
        {
          id: 'indemnity',
          title: '賠償',
          body:
            '您同意就因您使用本服務、您的內容、您的行為或與其他會員之互動所產生之請求，為 Spark Labs Ltd. 辯護並使其免受損害。',
        },
        {
          id: 'disputes',
          title: '爭議解決',
          body:
            `受 ${LEGAL_ENTITY.jurisdiction} 法律管轄。正式程序前請先聯絡 ${LEGAL_ENTITY.supportEmail}。除強制性消費者法律另有規定外，英格蘭及威爾斯法院具有專屬管轄權。`,
        },
        {
          id: 'termination',
          title: '終止與變更',
          body:
            '您可於設定中刪除帳戶。我們得因違規而暫停或終止存取權。重大條款變更將於應用程式內或依法律要求以電子郵件通知。生效日期後繼續使用即視為接受。',
        },
      ],
      footer: `${LEGAL_ENTITY.name} · ${LEGAL_ENTITY.address} · ${LEGAL_CONTACT_EMAIL}`,
    },
    privacy: {
      id: 'privacy',
      title: '隱私政策',
      effective,
      intro: `${LEGAL_ENTITY.name}（「Spark」、「我們」）說明在您使用 Spark 及 Pulse 時，我們如何收集、使用及保護個人資料。生物辨識驗證在法律要求之處須取得明確同意。`,
      sections: [
        {
          id: 'controller',
          title: '資料控制者',
          body:
            `${LEGAL_ENTITY.name}，${LEGAL_ENTITY.address}。隱私聯絡：${LEGAL_PRIVACY_EMAIL}。資料保護專員：${LEGAL_ENTITY.dpoEmail}。`,
        },
        {
          id: 'collect',
          title: '我們收集的資料',
          body:
            '帳戶資訊（姓名、電子郵件、年齡、性別、性取向）、個人檔案照片及簡介、訊息、位置（經許可）、使用及裝置紀錄、驗證自拍／身分證件（當您開始驗證時）、應用程式商店購買紀錄，以及網頁版之 Cookie／分析資料（經同意）。',
        },
        {
          id: 'use',
          title: '使用方式',
          body:
            '用於配對、訊息、偽裝模式、驗證、防詐、客服支援、分析（啟用時）、個人化（啟用時）及產品改進。行銷僅在取得同意或法律允許時進行。',
        },
        {
          id: 'share',
          title: '分享對象',
          body:
            '其他會員可見您個人檔案上之內容。我們使用身分驗證供應商、雲端託管儲存、分析服務商（網頁版經同意），並得在法律要求時揭露資料。我們不出售個人資料。',
        },
        {
          id: 'cookies',
          title: 'Cookie 及類似技術',
          body:
            '網頁版使用必要 Cookie 以運作應用程式，並在您同意後使用選用分析 Cookie。詳情及如何變更偏好請見 Cookie 政策。',
        },
        {
          id: 'rights',
          title: '您的權利',
          body:
            '依您所在地區，您可能享有存取、更正、刪除或移轉資料、反對處理及撤回同意之權利。請寄信至 privacy@spark.app，主旨註明「Data subject request」。您可於設定 → 隱私控制中刪除帳戶。',
        },
        {
          id: 'retention',
          title: '保留期限',
          body:
            '帳戶資料保留至刪除為止。驗證媒體通常於決定後 30 日內刪除。紀錄保留 12 至 24 個月後彙整或刪除。Cookie 偏好保留至您清除或撤回同意為止。',
        },
        {
          id: 'security',
          title: '安全',
          body:
            '我們使用傳輸加密、存取控制及監控。沒有任何方法能百分之百安全——如有疑慮請通報 security@spark.app。',
        },
        {
          id: 'regions',
          title: '地區通知',
          body:
            '依 GDPR／UK GDPR（歐盟／英國）、CCPA／CPRA（加州）、香港《個人資料（私隱）條例》及台灣《個人資料保護法》，您可能享有額外權利。請聯絡我們取得地區專屬通知，或向主管機關提出申訴。',
        },
        {
          id: 'children',
          title: '兒童',
          body: 'Spark 僅限 18 歲以上。我們不會故意收集 18 歲以下者之資料。若您認為未成年人已註冊，請聯絡我們。',
        },
      ],
      footer: `隱私相關問題：${LEGAL_PRIVACY_EMAIL}`,
    },
    community: {
      id: 'community',
      title: '社群規範',
      effective,
      intro: 'Spark 旨在促進尊重、誠實的連結——無論在 Spark 約會模式或 Pulse 偽裝模式。違規可能導致警告、限制、暫停或永久封禁。',
      sections: [
        {
          id: 'respect',
          title: '保持尊重',
          body:
            '禁止騷擾、仇恨言論、侮辱性用語、威脅、跟蹤，或在封鎖或取消配對後仍進行不受歡迎的聯絡。請以面對面時應有的方式對待他人。',
        },
        {
          id: 'honest',
          title: '保持誠實',
          body:
            '使用您本人近期照片。不得偽造驗證徽章、冒充他人，或虛報年齡、感情狀態或身份。',
        },
        {
          id: 'safe',
          title: '保持安全',
          body:
            '僅限 18 歲以上。禁止非法內容、詐騙、復仇式色情、非自願影像，或向陌生人索款。禁止宣傳暴力或自殘。',
        },
        {
          id: 'consent',
          title: '同意至關重要',
          body:
            '未經同意不得分享私人聊天、照片或影片。在訊息及面對面見面時請尊重對方界線。',
        },
        {
          id: 'disguise',
          title: '偽裝模式規則',
          body:
            'Pulse 旨在公共場合保護隱私——不得用於跟蹤、詐欺，或向第三方假裝偽裝卡片為真實新聞／廣告。詳見偽裝模式政策。',
        },
        {
          id: 'commercial',
          title: '禁止垃圾訊息或招攬',
          body:
            '不得利用 Spark 進行未經請求之廣告、金字塔騙局、伴遊服務或付費陪伴，除非獲 Spark 明確許可。',
        },
        {
          id: 'enforce',
          title: '執行與申訴',
          body:
            '透過應用程式選單檢舉（個人檔案或聊天 → 檢舉）。我們審查檢舉並可能不經通知即採取行動。申訴請寄 legal@spark.app 並附上帳戶電子郵件。',
        },
      ],
      footer: `社群相關問題：${LEGAL_CONTACT_EMAIL}`,
    },
    disguise: {
      id: 'disguise',
      title: '偽裝模式政策',
      effective,
      intro:
        'Pulse 偽裝模式將約會活動顯示為新聞／社交動態。本政策說明其功能與限制。',
      sections: [
        {
          id: 'purpose',
          title: '目的',
          body:
            '偽裝模式有助於在公共場合保護您的隱私。它不會向 Spark 隱藏您的資料、不會使您對既有配對匿名，也不會在您的裝置上加密訊息。',
        },
        {
          id: 'owner',
          title: '僅供使用者辨識之線索',
          body:
            '仔細閱讀可見「Profile」等標籤及遮罩頭像，以便區分偽裝卡片與真實新聞及廣告。陌生人瞥見您的螢幕時仍可能察覺這是社交應用程式。',
        },
        {
          id: 'rules',
          title: '禁止用途',
          body:
            '不得利用偽裝模式騷擾、詐騙、規避執法機關、侵犯商標、未經同意展示他人照片，或誤導第三方以為與新聞品牌有關聯。',
        },
        {
          id: 'illustrations',
          title: '示意內容',
          body:
            'Pulse 中的範例新聞品牌（BBC、The Guardian、NPR 等）及廣告風格卡片僅供示意——並非關聯、背書或即時聯播內容。',
        },
        {
          id: 'ads',
          title: '偽裝廣告與促銷',
          body:
            '部分卡片可能看似贊助內容。在偽裝模式下，這些代表 Spark 功能（Boost、Spark+ 等），而非第三方廣告主，除非另有明確標示。',
        },
        {
          id: 'limits',
          title: '限制',
          body:
            '偽裝模式無法防止螢幕截圖、肩窺、裝置存取，或認識您的人辨識出您。請鎖定裝置、使用應用程式鎖及作業系統隱私功能。',
        },
        {
          id: 'acceptance',
          title: '接受',
          body:
            '首次啟用及離開偽裝模式時須確認本政策。持續使用偽裝模式即表示您同意這些規則。',
        },
      ],
      footer: `偽裝模式相關問題：${LEGAL_CONTACT_EMAIL}`,
    },
    verification: {
      id: 'verification',
      title: '信任與驗證政策',
      effective,
      intro:
        '驗證徽章可提升信任，但並非背景調查或安全保證。部分檢查使用受監管之第三方供應商。',
      sections: [
        {
          id: 'badges',
          title: '徽章類型',
          body:
            '照片驗證（自拍與個人檔案照片相符）、真人驗證（活體掃描）、18 歲以上（經受監管供應商之身分證件查核）。各徽章相互獨立。',
        },
        {
          id: 'data',
          title: '驗證資料',
          body:
            '自拍、活體畫面、人臉比對分數及證件影像用於執行查核。第三方供應商（如 Onfido、FaceTec、Yoti）可能在嚴格合約下協助。媒體通常於決定後刪除；通過／未通過狀態保留於您的帳戶。',
        },
        {
          id: 'consent',
          title: '同意',
          body:
            '開始驗證即表示您同意如說明所述之生物辨識及身分資料處理。您可略過驗證；部分功能（如「已驗證」篩選）可能無法使用。',
        },
        {
          id: 'limits',
          title: '徽章不代表什麼',
          body:
            '並非犯罪背景調查。不保證安全、品格或意圖。若照片變更、疑似詐欺或複審未通過，徽章可能被撤銷。',
        },
        {
          id: 'revocation',
          title: '撤銷與申訴',
          body:
            '查核未通過或違反政策時，我們得不經通知撤銷徽章。申訴請寄 support@spark.app，主旨註明「Verification appeal」並附上帳戶電子郵件。',
        },
      ],
      footer: `驗證相關問題：${LEGAL_ENTITY.supportEmail} · 主旨請註明「Verification」`,
    },
    cookies: {
      id: 'cookies',
      title: 'Cookie 政策',
      effective,
      intro: `本政策說明 ${LEGAL_ENTITY.name} 如何在 Spark 網頁版使用 Cookie 及類似技術。行動應用程式使用裝置識別碼，受隱私政策規範。`,
      sections: [
        {
          id: 'what',
          title: '什麼是 Cookie？',
          body:
            'Cookie 是儲存於瀏覽器中的小型文字檔。我們亦使用本地儲存及類似技術以維持工作階段狀態及偏好設定。',
        },
        {
          id: 'essential',
          title: '必要 Cookie',
          body:
            '運作 Spark 網頁版所必需：登入工作階段、安全權杖、偽裝模式狀態及同意偏好。使用本服務期間無法停用。',
        },
        {
          id: 'analytics',
          title: '分析 Cookie（選用）',
          body:
            '經您同意，我們使用匿名分析以了解使用情況並修復錯誤。您可在 Cookie 橫幅選擇「僅必要」，或在隱私控制中停用分析。',
        },
        {
          id: 'personalisation',
          title: '個人化',
          body:
            '啟用時，我們可能儲存偏好以排序個人檔案及內容。此與行銷 Cookie 分開，可在隱私控制中切換。',
        },
        {
          id: 'third-party',
          title: '第三方 Cookie',
          body:
            '我們盡量減少第三方 Cookie。網頁版付款流程可能使用商店或付款服務商之 Cookie，受其政策規範。Spark 網頁版不使用第三方廣告追蹤器。',
        },
        {
          id: 'manage',
          title: '如何管理 Cookie',
          body:
            '首次造訪時使用 Cookie 橫幅、設定中的隱私控制，或瀏覽器設定以封鎖／刪除 Cookie。封鎖必要 Cookie 可能導致 Spark 網頁版無法運作。',
        },
        {
          id: 'retention',
          title: '保留期限',
          body:
            '工作階段 Cookie 於關閉瀏覽器時失效。同意紀錄保留至您撤回同意或清除網站資料。分析 Cookie 通常於 13 個月內到期。',
        },
      ],
      footer: `Cookie 相關問題：${LEGAL_PRIVACY_EMAIL}`,
    },
    subscription: {
      id: 'subscription',
      title: '訂閱與購買條款',
      effective,
      intro:
        '本條款適用於 Spark+ 訂閱及應用程式內購買（Boost、Spark Notes、Roses 等），透過 Apple App Store、Google Play 或授權付款服務商計費。',
      sections: [
        {
          id: 'plans',
          title: 'Spark+ 方案',
          body:
            'Spark+ 為定期訂閱（每週、每月或每年），解鎖進階功能，如無限喜歡、查看誰喜歡您、倒帶、已讀回條及隱身模式。功能可用性可能因地區及平台而異。',
        },
        {
          id: 'billing',
          title: '帳單與自動續訂',
          body:
            '確認購買時向您的 Apple ID 或 Google 帳戶收費。訂閱自動續訂，除非於目前期間結束前至少 24 小時取消。續訂費用於期間結束前 24 小時內自帳戶扣款。',
        },
        {
          id: 'cancel',
          title: '取消',
          body:
            '可隨時於 iOS 設定 → Apple ID → 訂閱項目，或 Google Play → 付款與訂閱中取消。取消於目前帳單期間結束時生效。刪除應用程式不會取消訂閱。',
        },
        {
          id: 'consumables',
          title: '消耗型商品',
          body:
            'Boost、Spark Notes、Roses 及類似一次性購買立即生效，一經使用即不可退款，除商店政策或法律另有規定外。',
        },
        {
          id: 'free-trial',
          title: '免費試用與促銷',
          body:
            '介紹優惠或免費試用將轉為付費訂閱，除非於試用結束前取消。資格及價格於購買時顯示，可能變更。',
        },
        {
          id: 'refunds',
          title: '退款',
          body:
            '退款由 Apple 或 Google 依其政策處理。帳單爭議請直接聯絡商店。我們無法直接處理商店購買之退款。',
        },
        {
          id: 'price-changes',
          title: '價格變更',
          body:
            '我們得在商店或適用法律要求通知下變更訂閱價格。在法律允許範圍內，價格變更後繼續使用即視為接受。',
        },
        {
          id: 'demo',
          title: '示範版本',
          body:
            '原型及示範版本可能模擬購買而不實際收費。正式版本使用商店即時帳單。',
        },
      ],
      footer: `帳單相關問題：${LEGAL_ENTITY.supportEmail}`,
    },
    safety: {
      id: 'safety',
      title: '安全聲明',
      effective,
      intro:
        'Spark 協助您認識他人，但無法保證您的安全。請在與任何人面對面見面前閱讀本聲明。',
      sections: [
        {
          id: 'risk',
          title: '固有風險',
          body:
            '線上約會及與陌生人見面具有固有風險，包括騷擾、詐欺、攻擊及竊盜。您須自行承擔使用 Spark 及與其他會員互動所產生之一切風險。',
        },
        {
          id: 'verification',
          title: '驗證並非安全保證',
          body:
            '照片、活體及年齡徽章僅確認特定時間點通過查核。並非背景調查，也不代表單獨見面是安全的。',
        },
        {
          id: 'meetings',
          title: '面對面見面',
          body:
            '在公共場所見面，告知朋友您的計畫，自行安排交通，並相信直覺。使用聊天中的約會報平安功能分享見面地點。若感到不適請離開。',
        },
        {
          id: 'report',
          title: '檢舉與封鎖',
          body:
            '透過個人檔案或聊天選單檢舉可疑行為。封鎖會立即將對方從您的卡片堆及聊天中移除。緊急情況請先聯絡當地緊急服務，再聯絡 support@spark.app。',
        },
        {
          id: 'resources',
          title: '資源',
          body:
            '安全提示及常見問題請見 spark.app/safety。若您處於立即危險，請撥打當地緊急電話。美國：National Domestic Violence Hotline 1-800-799-7233。英國：999。',
        },
        {
          id: 'liability',
          title: '無保護義務',
          body:
            'Spark 不對會員在平台內外之行為負責。我們提供檢舉及封鎖工具，但無法防止所有傷害。責任限制詳見使用者條款。',
        },
      ],
      footer: `安全相關問題：${LEGAL_ENTITY.supportEmail}`,
    },
  };
}
