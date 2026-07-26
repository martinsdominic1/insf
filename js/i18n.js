// ===================================================================
// i18n.js — simple EN / PT language switcher for the parish website
// ===================================================================
// How it works:
// 1. On first visit, we try to guess the visitor's country from their
//    IP address (via a free lookup API) and default to Portuguese if
//    they're in Portugal, Brazil, Angola, Mozambique, etc. Everyone
//    else defaults to English.
// 2. Whatever the visitor picks with the language button is saved in
//    localStorage, so their choice always wins on later visits.
// 3. Translating text: any element with data-i18n="key" has its
//    TEXT swapped; any element with data-i18n-html="key" has its
//    inner HTML swapped (use this only when the original text
//    contains tags like <em> or <span>, e.g. the big hero heading).

const translations = {
  en: {
    nav_mass: "Mass Times",
    nav_bulletins: "Bulletins",
    nav_notices: "Notices",
    nav_hall: "Hall Hire",
    nav_contact: "Contact",
    nav_contact_drawer: "📞 Contact Us",

    hero_tag: "Portuguese Catholic Parish · Benoni",
    hero_h1: "<em>Our lady of Fátima</em><br>Catholic Church<br><span class=\"gold\">Brentwood Park</span>",
    hero_sub: "A parish community rooted in devotion to Our Lady of Fátima since the 1940s. All are welcome to join us for Mass, browse our latest bulletins, or reach out to the parish office below.",
    btn_view_mass: "🕊️ View Mass Times",
    btn_hire_hall: "🏛️ Hire the Parish Hall",

    stat_lbl1: "Foundation Stone Blessed",
    stat_lbl2: "Inaugurated",
    glance_label: "Parish at a Glance",
    cert1: "4 Masses every Weekend",
    cert2: "Daily Morning Mass, Monday–Friday",
    cert3: "Portuguese & English Masses",
    cert4: "Parish hall available for hire",

    mass_eyebrow: "Join Us",
    mass_h2: "Mass <em>Times</em>",
    mass_lead: "Please note: The Mass times below reflect our regular timetable. Special celebrations, festas, and parish events may affect these times. Refer to the weekly bulletin for updates and additional Masses.",
    weekdays_day: "Weekdays",
    weekdays_note: "Monday – Friday",
    mass_pt: "(Portuguese Mass)",
    mass_en: "(English Mass)",
    saturday_day: "Saturday",
    one_mass: "1 Mass",
    confessions: "(Confessions and Eucharistic Adoration)",
    sunday_day: "Sunday",
    three_masses: "3 Masses",

    bulletins_eyebrow: "Stay Informed",
    bulletins_h2: "Parish <em>Bulletins</em>",
    bulletins_loading: "Loading bulletins…",

    notices_eyebrow: "Find out more",
    notices_h2: "Parish <em>Notices</em>",
    notices_loading: "Loading notices…",

    hall_eyebrow: "Book a Venue",
    hall_h2: "Hall for <em>Hire</em>",
    hall_lead: "Complete the form below to request the parish hall for your event. The parish office will confirm availability and next steps.",
    form_h3: "Parish Hall Hire Request",
    form_p: "Please complete all fields so that the office can process your request as quickly as possible.",
    pill1: "Event date & time",
    pill2: "Expected guests",
    pill3: "Type of event",
    pill4: "Contact details",
    pill5: "Setup requirements",
    form_footer_p: "💡 If the form doesn't display above, use the button to open it directly in a new tab.",
    open_form: "Open Form",

    contact_eyebrow: "Get in Touch",
    contact_h2: "Contact &amp; <em>Location</em>",
    contact_lead: "Reach the parish office directly, or find us at Brentwood Park.",
    address_lbl: "📍 Address",
    secretary_lbl: "☎️ Parish Secretary",
    email_lbl: "✉️ Parish Email",
    dir_btn: "Open in Google Maps",
    fb_h4: "Follow the Parish on Facebook",
    fb_p: "News, event photos and reminders posted between bulletins.",
    fb_btn: "📘 Visit Facebook Page",

    footer_desc: "Our Lady of Fátima Portuguese Catholic Church — Brentwood Park, Benoni.",
    footer_badge: "🕯️ Established 1945",
    footer_nav_title: "Navigation",
    footer_contact_title: "Contact",
    footer_rights: "© 2026 Igreja de Nossa Senhora de Fátima, Brentwood Park. All rights reserved."
  },

  pt: {
    nav_mass: "Horários das Missas",
    nav_bulletins: "Boletins",
    nav_notices: "Avisos",
    nav_hall: "Aluguer do Salão",
    nav_contact: "Contacto",
    nav_contact_drawer: "📞 Contacte-nos",

    hero_tag: "Paróquia Católica Portuguesa · Benoni",
    hero_h1: "Igreja de<br><em>Nossa Senhora de Fátima</em><br><span class=\"gold\">Brentwood Park</span>",
    hero_sub: "Uma comunidade paroquial enraizada na devoção a Nossa Senhora de Fátima desde a década de 1940. Todos são bem-vindos para participar na Missa, consultar os nossos boletins mais recentes, ou contactar o secretariado paroquial abaixo.",
    btn_view_mass: "🕊️ Ver Horários das Missas",
    btn_hire_hall: "🏛️ Alugar o Salão Paroquial",

    stat_lbl1: "Bênção da Pedra Fundamental",
    stat_lbl2: "Inauguração",
    glance_label: "A Paróquia em Resumo",
    cert1: "4 Missas todos os Fins de Semana",
    cert2: "Missa Matinal Diária, Segunda a Sexta",
    cert3: "Missas em Português e Inglês",
    cert4: "Salão paroquial disponível para aluguer",

    mass_eyebrow: "Junte-se a Nós",
    mass_h2: "Horários das <em>Missas</em>",
    mass_lead: "Nota: Os horários abaixo refletem o nosso horário habitual. Celebrações especiais, festas e eventos paroquiais podem alterar estes horários. Consulte o boletim semanal para atualizações e Missas adicionais.",
    weekdays_day: "Dias Úteis",
    weekdays_note: "Segunda a Sexta",
    mass_pt: "(Missa em Português)",
    mass_en: "(Missa em Inglês)",
    saturday_day: "Sábado",
    one_mass: "1 Missa",
    confessions: "(Confissões e Adoração Eucarística)",
    sunday_day: "Domingo",
    three_masses: "3 Missas",

    bulletins_eyebrow: "Fique Informado",
    bulletins_h2: "Boletins <em>Paroquiais</em>",
    bulletins_loading: "A carregar boletins…",

    notices_eyebrow: "Saiba mais",
    notices_h2: "Avisos <em>Paroquiais</em>",
    notices_loading: "A carregar avisos…",

    hall_eyebrow: "Reserve o Espaço",
    hall_h2: "Salão para <em>Aluguer</em>",
    hall_lead: "Preencha o formulário abaixo para solicitar o salão paroquial para o seu evento. O secretariado confirmará a disponibilidade e os próximos passos.",
    form_h3: "Pedido de Aluguer do Salão Paroquial",
    form_p: "Preencha todos os campos para que o secretariado possa processar o seu pedido o mais rapidamente possível.",
    pill1: "Data e hora do evento",
    pill2: "Número de convidados",
    pill3: "Tipo de evento",
    pill4: "Dados de contacto",
    pill5: "Requisitos de montagem",
    form_footer_p: "💡 Se o formulário não aparecer acima, use o botão para o abrir diretamente noutra aba.",
    open_form: "Abrir Formulário",

    contact_eyebrow: "Entre em Contacto",
    contact_h2: "Contacto e <em>Localização</em>",
    contact_lead: "Contacte o secretariado paroquial diretamente, ou encontre-nos em Brentwood Park.",
    address_lbl: "📍 Morada",
    secretary_lbl: "☎️ Secretariado Paroquial",
    email_lbl: "✉️ Email da Paróquia",
    dir_btn: "Abrir no Google Maps",
    fb_h4: "Siga a Paróquia no Facebook",
    fb_p: "Notícias, fotos de eventos e lembretes publicados entre boletins.",
    fb_btn: "📘 Visitar Página do Facebook",

    footer_desc: "Igreja Católica Portuguesa Nossa Senhora de Fátima — Brentwood Park, Benoni.",
    footer_badge: "🕯️ Fundada em 1945",
    footer_nav_title: "Navegação",
    footer_contact_title: "Contacto",
    footer_rights: "© 2026 Igreja de Nossa Senhora de Fátima, Brentwood Park. Todos os direitos reservados."
  }
};

// Country codes where Portuguese is the/an official or majority language.
const PORTUGUESE_SPEAKING_COUNTRIES = [
  "PT", "BR", "AO", "MZ", "CV", "GW", "ST", "TL", "GQ"
];

const STORAGE_KEY = "parish_lang";

function applyLanguage(lang) {
  const dict = translations[lang] || translations.en;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.documentElement.lang = lang === "pt" ? "pt" : "en";

  document.querySelectorAll(".lang-option").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });

  localStorage.setItem(STORAGE_KEY, lang);
}

function setLanguage(lang) {
  applyLanguage(lang);
}

async function detectDefaultLanguage() {
  // 1) Respect a saved choice first.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "pt") return saved;

  // 2) Try IP-based country lookup (no API key needed, CORS-friendly).
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        return PORTUGUESE_SPEAKING_COUNTRIES.includes(data.country_code.toUpperCase()) ? "pt" : "en";
      }
    }
  } catch (e) {
    // Ignore — fall through to the browser-language fallback below.
  }

  // 3) Fallback: guess from the browser's own language setting.
  const browserLang = (navigator.language || "en").toLowerCase();
  return browserLang.startsWith("pt") ? "pt" : "en";
}

function currentLanguage() {
  return document.documentElement.lang === "pt" ? "pt" : "en";
}

document.addEventListener("DOMContentLoaded", async () => {
  const lang = await detectDefaultLanguage();
  applyLanguage(lang);

  const toggle = document.getElementById("langToggle");
  const dropdown = document.getElementById("langDropdown");

  const closeDropdown = () => {
    if (!dropdown) return;
    dropdown.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  };

  const openDropdown = () => {
    if (!dropdown) return;
    dropdown.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  };

  if (toggle && dropdown) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.hidden ? openDropdown() : closeDropdown();
    });

    document.querySelectorAll(".lang-option").forEach(btn => {
      btn.addEventListener("click", () => {
        setLanguage(btn.getAttribute("data-lang"));
        closeDropdown();
      });
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== toggle) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });
  }
});
