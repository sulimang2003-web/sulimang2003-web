// Static page content. ⚠️ Policies are DRAFT templates and must be reviewed by a Turkish lawyer
// (Mesafeli Sözleşmeler Yönetmeliği, 6502 TKHK, KVKK 6698, ETBİS) before launch.
type Section = { h: string; p?: string; list?: string[] };
type Page = { title: string; intro?: string; sections: Section[] };
type L = { ar: Page; tr: Page };

export const policies: Record<"shipping" | "returns" | "privacy" | "terms", L> = {
  shipping: {
    ar: { title: "سياسة التوصيل", sections: [
      { h: "مناطق التوصيل", p: "نوصل إلى جميع المدن التركية عبر شركات شحن معتمدة، ونوفر توصيلاً سريعاً داخل إسطنبول." },
      { h: "المدة المتوقعة", list: ["إسطنبول: 1–2 يوم عمل", "باقي تركيا: 2–4 أيام عمل", "تُجهَّز الطلبات المؤكدة قبل الساعة 15:00 في نفس اليوم"] },
      { h: "التكلفة", p: "تُحسب تكلفة الشحن عند إتمام الطلب وفق المدينة، والشحن مجاني فوق الحد المعلن. تُحدَّث القيم من لوحة الإدارة." },
      { h: "الاستلام من المتجر", p: "يمكنك استلام طلبك من متجرنا في الفاتح بعد تأكيد الجاهزية عبر واتساب." },
    ] },
    tr: { title: "Teslimat Politikası", sections: [
      { h: "Teslimat Bölgeleri", p: "Anlaşmalı kargo firmalarıyla Türkiye'nin tüm illerine, İstanbul içine ise hızlı teslimat yapıyoruz." },
      { h: "Tahmini Süre", list: ["İstanbul: 1–2 iş günü", "Türkiye geneli: 2–4 iş günü", "Saat 15:00'e kadar onaylanan siparişler aynı gün hazırlanır"] },
      { h: "Ücret", p: "Kargo ücreti ödeme adımında ile göre hesaplanır; belirtilen tutarın üzerindeki siparişlerde ücretsizdir." },
      { h: "Mağazadan Teslim", p: "Siparişinizi WhatsApp onayından sonra Fatih'teki mağazamızdan teslim alabilirsiniz." },
    ] },
  },
  returns: {
    ar: { title: "الاستبدال والإرجاع", sections: [
      { h: "حق الانسحاب", p: "وفق قانون حماية المستهلك التركي رقم 6502 ولائحة العقود عن بُعد، يحق للمستهلك الانسحاب خلال 14 يوماً من استلام المنتج دون إبداء أسباب." },
      { h: "الشروط", list: ["أن يكون المنتج غير مستخدم وبملصقاته الأصلية", "إرفاق الفاتورة", "التواصل معنا عبر واتساب أو البريد قبل الإرسال"] },
      { h: "استبدال المقاس", p: "نوفر استبدال المقاس حسب التوفر. تكلفة الشحن في حالة الاستبدال تُحدد وفق السياسة المعتمدة." },
      { h: "استرداد المبلغ", p: "يُعاد المبلغ بنفس وسيلة الدفع خلال 14 يوماً من استلامنا لإشعار الانسحاب وفق القانون." },
    ] },
    tr: { title: "Değişim ve İade", sections: [
      { h: "Cayma Hakkı", p: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, ürünü teslim aldığınız tarihten itibaren 14 gün içinde gerekçe göstermeksizin cayma hakkınız vardır." },
      { h: "Koşullar", list: ["Ürün kullanılmamış ve etiketleri sökülmemiş olmalıdır", "Fatura ile birlikte gönderilmelidir", "Göndermeden önce WhatsApp veya e-posta ile bize bildirin"] },
      { h: "Beden Değişimi", p: "Stok durumuna göre beden değişimi yapılır." },
      { h: "Ücret İadesi", p: "Cayma bildiriminin bize ulaşmasından itibaren 14 gün içinde ödeme aynı yöntemle iade edilir." },
    ] },
  },
  privacy: {
    ar: { title: "الخصوصية و KVKK", sections: [
      { h: "مسؤول البيانات", p: "Yusuf Score (يُستكمل: الاسم التجاري الرسمي، العنوان، الرقم الضريبي) بصفته مسؤولاً عن البيانات وفق قانون حماية البيانات الشخصية التركي رقم 6698." },
      { h: "البيانات التي نجمعها", list: ["الاسم ورقم الهاتف والبريد الإلكتروني", "عنوان التوصيل", "تفاصيل الطلب", "بيانات تقنية وملفات تعريف الارتباط (بموافقتك للأغراض التحليلية والتسويقية)"] },
      { h: "أغراض المعالجة", p: "تنفيذ الطلب والتوصيل، التواصل بخصوص الطلب، الالتزامات القانونية والمحاسبية، وبموافقتك: التحليلات والإعلانات." },
      { h: "النقل للخارج", p: "قد تُستضاف البيانات لدى مزودي خدمات سحابية خارج تركيا؛ يجب مراجعة شروط النقل وفق تعديلات KVKK المادة 9 قبل الإطلاق." },
      { h: "حقوقك", p: "يحق لك وفق المادة 11 من KVKK طلب الاطلاع على بياناتك أو تصحيحها أو حذفها. تواصل معنا عبر البريد المذكور في صفحة التواصل." },
    ] },
    tr: { title: "Gizlilik ve KVKK Aydınlatma Metni", sections: [
      { h: "Veri Sorumlusu", p: "6698 sayılı KVKK kapsamında veri sorumlusu: Yusuf Score (tamamlanacak: ticari unvan, adres, vergi no, MERSİS no)." },
      { h: "İşlenen Veriler", list: ["Ad soyad, telefon, e-posta", "Teslimat adresi", "Sipariş bilgileri", "Teknik veriler ve çerezler (analitik/pazarlama amaçlı olanlar açık rızanızla)"] },
      { h: "İşleme Amaçları", p: "Siparişin ifası ve teslimatı, siparişle ilgili iletişim, yasal yükümlülükler; açık rızanızla analiz ve reklam." },
      { h: "Yurt Dışına Aktarım", p: "Veriler yurt dışındaki bulut hizmet sağlayıcılarında barındırılabilir; KVKK m.9 kapsamındaki aktarım şartları yayından önce değerlendirilmelidir." },
      { h: "Haklarınız", p: "KVKK m.11 uyarınca verilerinize erişme, düzeltme ve silinmesini talep etme hakkınız vardır." },
    ] },
  },
  terms: {
    ar: { title: "شروط البيع عن بُعد", intro: "نموذج أولي لعقد البيع عن بُعد (Mesafeli Satış Sözleşmesi) — يجب أن يُعرض للعميل كاملاً قبل تأكيد الطلب بعد مراجعته قانونياً.", sections: [
      { h: "الأطراف", p: "البائع: Yusuf Score (يُستكمل: الاسم التجاري، العنوان، الهاتف، البريد، MERSİS). المشتري: بيانات العميل المدخلة في صفحة الإتمام." },
      { h: "موضوع العقد", p: "بيع المنتجات الموضحة في ملخص الطلب بالأسعار شاملة الضريبة وتكاليف الشحن المعلنة." },
      { h: "التسليم", p: "يتم التسليم خلال المدة المعلنة وبحد أقصى 30 يوماً وفق اللائحة." },
      { h: "حق الانسحاب", p: "14 يوماً من تاريخ الاستلام وفق سياسة الإرجاع." },
      { h: "تسوية النزاعات", p: "هيئات تحكيم المستهلك (Tüketici Hakem Heyeti) ومحاكم المستهلك المختصة." },
    ] },
    tr: { title: "Mesafeli Satış Sözleşmesi", intro: "Taslak şablon — hukuki inceleme sonrası sipariş onayından önce eksiksiz olarak tüketiciye sunulmalıdır (Ön Bilgilendirme Formu dahil).", sections: [
      { h: "Taraflar", p: "Satıcı: Yusuf Score (tamamlanacak: unvan, adres, telefon, e-posta, MERSİS no). Alıcı: Ödeme sayfasında girilen müşteri bilgileri." },
      { h: "Konu", p: "Sipariş özetinde belirtilen ürünlerin KDV dahil fiyatlar ve belirtilen kargo bedeli ile satışı." },
      { h: "Teslimat", p: "Ürünler belirtilen sürede, en geç 30 gün içinde teslim edilir." },
      { h: "Cayma Hakkı", p: "Teslimden itibaren 14 gün; iade politikasına bakınız." },
      { h: "Uyuşmazlıklar", p: "Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir." },
    ] },
  },
};

export const about: L = {
  ar: { title: "عن Yusuf Score", intro: "علامة رجالية وُلدت في قلب الفاتح بإسطنبول.", sections: [
    { h: "البداية", p: "بدأنا بمتجر في منطقة الفاتح، نختار كل قطعة بأنفسنا ونعرف عملاءنا بالاسم. هذا القرب هو ما نريد أن نحمله إلى تجربة التسوق الرقمية." },
    { h: "ما نؤمن به", list: ["خامات مختارة وتشطيب متقن", "قصّات عصرية تناسب الرجل العربي والتركي", "سعر عادل وخدمة شخصية عبر واتساب", "تجربة مقاس في المتجر لمن يرغب"] },
    { h: "مجتمعنا", p: "يتابعنا عشرات الآلاف على إنستغرام @yusufscore حيث نشارك الإطلالات اليومية والوصولات الجديدة أولاً بأول." },
  ] },
  tr: { title: "Yusuf Score Hakkında", intro: "İstanbul Fatih'in kalbinde doğmuş bir erkek giyim markası.", sections: [
    { h: "Başlangıç", p: "Fatih'te bir mağaza ile başladık; her parçayı kendimiz seçiyor, müşterilerimizi ismiyle tanıyoruz. Bu yakınlığı dijital alışverişe taşımak istiyoruz." },
    { h: "İnandıklarımız", list: ["Seçkin kumaşlar ve özenli işçilik", "Modern kesimler", "Adil fiyat ve WhatsApp üzerinden kişisel hizmet", "Dileyenler için mağazada deneme"] },
    { h: "Topluluğumuz", p: "Instagram'da @yusufscore hesabımızda on binlerce takipçimizle günlük kombinleri ve yeni gelenleri paylaşıyoruz." },
  ] },
};

export const faq: { ar: [string, string][]; tr: [string, string][] } = {
  ar: [
    ["كيف أطلب؟", "أضف المنتجات للسلة ثم أكمل الطلب، وسيُرسل ملخصه إلى فريقنا على واتساب لتأكيد المقاس والتوصيل. يمكنك أيضاً الطلب مباشرة من صفحة المنتج عبر زر واتساب."],
    ["ما طرق الدفع المتاحة؟", "حالياً: الدفع عند الاستلام أو التحويل البنكي أو في المتجر، ويُتفق عليها عبر واتساب. الدفع الإلكتروني بالبطاقة قريباً."],
    ["كم تستغرق مدة التوصيل؟", "داخل إسطنبول 1–2 يوم عمل، وباقي تركيا 2–4 أيام عمل."],
    ["هل يمكنني تبديل المقاس؟", "نعم، خلال 14 يوماً حسب التوفر ووفق سياسة الاستبدال."],
    ["كيف أعرف مقاسي؟", "راجع دليل المقاسات في صفحة المنتج أو راسلنا على واتساب مع طولك ووزنك وسننصحك."],
    ["هل يمكنني زيارة المتجر؟", "بالتأكيد، متجرنا في الفاتح بإسطنبول مفتوح يومياً."],
  ],
  tr: [
    ["Nasıl sipariş verebilirim?", "Ürünleri sepete ekleyip siparişi tamamlayın; özet, beden ve teslimat onayı için WhatsApp'tan ekibimize iletilir. Ürün sayfasındaki WhatsApp butonuyla da doğrudan sipariş verebilirsiniz."],
    ["Hangi ödeme yöntemleri var?", "Şu an kapıda ödeme, havale/EFT veya mağazada ödeme. Kartla online ödeme yakında."],
    ["Teslimat ne kadar sürer?", "İstanbul içi 1–2, Türkiye geneli 2–4 iş günü."],
    ["Beden değişimi yapabilir miyim?", "Evet, 14 gün içinde stok durumuna göre."],
    ["Bedenimi nasıl bilirim?", "Ürün sayfasındaki beden tablosuna bakın ya da boy-kilo bilginizle WhatsApp'tan yazın."],
    ["Mağazayı ziyaret edebilir miyim?", "Elbette, Fatih'teki mağazamız her gün açık."],
  ],
};
