// Array: Add more orphanages simply by adding objects
const orphanages = [
  {
    name: "Centre d'Accueil Eau Vive",
    city: "Borne Fontaine Emana, Yaoundé",
    phone: "+237 655 02 98 67",
    img: "assets/orp1.jpeg",
    desc: "L’orphelinat a pour mission de soutenir les enfants orphelins, les personnes défavorisées et âgées en créant des structures d’accueil, d’éducation, d’insertion sociale et de développement socio-économique.",      
    verified: true
  },
  {
    name: "Orphelinat La Sainte Famille",
    city: "Messamendongo, Yaoundé",
    phone: "+237 690 47 64 37",
    img: "assets/orp2.jpeg",
    desc: "L'Orphelinat La Sainte Famille de Messamendongo est une structure ouverte à l’accueil des enfants en détresse et abandonnés",
    verified: true
  },
  {
    name: "Orphelinat DIVIN",
    city: "Mendong, Yaoundé",
    phone: "+237 655 02 98 67",
    img: "assets/orp3.jpeg",
    desc: "L'orphelinat Divin a pour principale mission d'accueillir les enfants en détresse",
    verified: true
  }
  // Add your 4th orphanage here...
];

// Build cards automatically
const container = document.getElementById("orphanage-container");

orphanages.forEach(org => {
  const card = document.createElement("article");
  card.className = "card";

  card.innerHTML = `
    <img src="${org.img}" alt="${org.name}">
    <div class="card-body">
      <h3>${org.name}</h3>
      <p class="location">${org.city}</p>
      <span class="badge">${org.verified ? "Verified" : "Unverified"}</span>
      <p class="card-desc">${org.desc}</p>

      <div class="phone">
        <span class="phone-icon">📞</span>
        <a href="tel:${org.phone.replace(/\s+/g, '')}">${org.phone}</a>
      </div>

      <div class="card-actions">
        <button class="btn view">View Profile</button>
        <button class="btn donate">Donate</button>
      </div>
    </div>
  `;

  container.appendChild(card);
});
