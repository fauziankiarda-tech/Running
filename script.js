const diam = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);

// Menu HP
const menu = $("#menu"), toggle = $("#toggle");
const aturMenu = (buka) => { menu.classList.toggle("buka", buka); toggle.setAttribute("aria-expanded", buka); };
toggle.addEventListener("click", () => aturMenu(!menu.classList.contains("buka")));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) aturMenu(false); });

// Angka berhitung saat terlihat
function hitung(el) {
    const target = Number(el.dataset.hitung), mulai = performance.now();
    (function langkah(t) {
        const p = Math.min(Math.max((t - mulai) / 1200, 0), 1);
        el.textContent = Math.round(target * p);
        if (p < 1) requestAnimationFrame(langkah);
    })(mulai);
}

// Elemen muncul saat di-scroll
if ("IntersectionObserver" in window) {
    const pengamat = new IntersectionObserver((daftar) => {
        daftar.forEach((d) => {
            if (!d.isIntersecting) return;
            d.target.classList.add("tampil");
            const angka = d.target.querySelector("[data-hitung]");
            if (angka && !diam) hitung(angka);
            pengamat.unobserve(d.target);
        });
    }, { threshold: 0.15 });
    document.querySelectorAll(".muncul").forEach((el) => pengamat.observe(el));
} else {
    document.querySelectorAll(".muncul").forEach((el) => el.classList.add("tampil"));
}

// Efek yang mengikuti scroll
const lintasan = $(".lintasan"), rel = $("#rel"), pelari = $("#pelari");
const bagian = document.querySelectorAll("main section[id]");
let jarakGeser = 0;

function ukur() {
    const lebar = !diam && innerWidth > 850 && innerHeight > 600;
    lintasan.classList.toggle("horizontal", lebar);
    lintasan.style.height = "";
    rel.style.transform = "";
    if (lebar) {
        jarakGeser = Math.max(rel.scrollWidth - document.documentElement.clientWidth, 0);
        lintasan.style.height = `${innerHeight - 70 + jarakGeser}px`;
    }
    saatScroll();
}

function saatScroll() {
    const y = scrollY;
    const total = document.documentElement.scrollHeight - innerHeight;
    $("#progresIsi").style.transform = `scaleX(${total ? y / total : 0})`;

    let aktif = "";
    bagian.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight / 2) aktif = s.id; });
    menu.querySelectorAll("a").forEach((a) => a.classList.toggle("aktif", a.hash === "#" + aktif));

    if (diam) return;
    document.querySelectorAll("[data-parallax]").forEach((el) => {
        el.style.transform = `translateY(${Math.min(y, innerHeight) * el.dataset.parallax * 0.3}px)`;
    });
    document.querySelectorAll("[data-geser]").forEach((el) => {
        el.style.transform = `translateX(${(y * el.dataset.geser) % (el.scrollWidth / 2)}px)`;
    });
    if (lintasan.classList.contains("horizontal") && jarakGeser) {
        const p = Math.min(Math.max((70 - lintasan.getBoundingClientRect().top) / jarakGeser, 0), 1);
        rel.style.transform = `translateX(${-p * jarakGeser}px)`;
        pelari.style.left = `calc(${p * 100}% - ${p * 40}px)`;
        pelari.style.transform = `translateY(${-Math.abs(Math.sin(p * 60)) * 8}px)`;
    }
}

let menunggu = false;
addEventListener("scroll", () => {
    if (menunggu) return;
    menunggu = true;
    requestAnimationFrame(() => { saatScroll(); menunggu = false; });
}, { passive: true });
addEventListener("resize", ukur);
addEventListener("load", ukur);
ukur();

// Program 9 minggu
const program = [
    "Lari 1 menit + jalan 1,5 menit, ulangi 7 kali, lalu lari 1 menit.",
    "Lari 1,5 menit + jalan 2 menit, ulangi 5 kali, lalu lari 1,5 menit.",
    "Lari 1,5 · jalan 1,5 · lari 3 · jalan 3 · lari 1,5 · jalan 1,5 · lari 3 (menit).",
    "Lari 3 · jalan 1,5 · lari 5 · jalan 2,5 · lari 3 · jalan 1,5 · lari 5 (menit).",
    "Sesi 1: lari 5, jalan 3, lari 5, jalan 3, lari 5. Sesi 2: lari 8, jalan 5, lari 8. Sesi 3: lari 20 menit.",
    "Sesi 1: lari 5, jalan 3, lari 8, jalan 3, lari 5. Sesi 2: lari 10, jalan 3, lari 10. Sesi 3: lari 25 menit.",
    "Lari 25 menit tanpa jeda di ketiga sesi.",
    "Lari 28 menit tanpa jeda di ketiga sesi.",
    "Lari 30 menit tanpa jeda di ketiga sesi."
];
const wadah = $("#tombolMinggu");
function pilih(i) {
    [...wadah.children].forEach((b, n) => b.setAttribute("aria-pressed", n === i));
    $("#isiMinggu").innerHTML = `<h3>Minggu ${i + 1}</h3><p>${program[i]}</p>`;
}
program.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = i + 1;
    b.setAttribute("aria-label", `Minggu ${i + 1}`);
    b.addEventListener("click", () => pilih(i));
    wadah.appendChild(b);
});
pilih(0);

// Kalkulator pace
const form = $("#formPace");
form.addEventListener("submit", (e) => e.preventDefault());
form.addEventListener("input", () => {
    const km = Number($("#jarak").value), menit = Number($("#waktu").value);
    if (!(km > 0 && menit > 0)) { $("#hasil").textContent = "Isi jarak dan waktu"; return; }
    const detik = Math.round((menit * 60) / km);
    const kecepatan = (km / (menit / 60)).toLocaleString("id-ID", { maximumFractionDigits: 1 });
    $("#hasil").textContent = `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, "0")} /km · ${kecepatan} km/jam`;
});
