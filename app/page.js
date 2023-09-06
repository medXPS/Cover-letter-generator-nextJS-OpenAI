"use client"; // Marquez le composant comme composant client
import { useState } from "react";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Swal from "sweetalert2";
import { openai } from "./util";

export default function Home() {
  // Définir les variables d'état pour le chargement et les saisies de l'utilisateur
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [degree, setDegree] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [specialtyOne, setSpecialtyOne] = useState("");
  const [specialtyTwo, setSpecialtyTwo] = useState("");

  // Fonction pour générer la lettre de motivation en utilisant l'API OpenAI
  const generateCoverLetter = async (
    position,
    company,
    degree,
    experience,
    specialty1,
    specialty2
  ) => {
    // Définir l'état de chargement sur true
    setLoading(true);

    // Construire la requête pour l'API OpenAI
    const prompt = `Veuillez générer le contenu d'une lettre de motivation pour un poste de ${position} chez ${company}.
    J'ai un diplôme en ${degree} avec ${experience} années d'expérience(s) dans le domaine de ${specialty1} et ${specialty2}. 
    Limitez à trois paragraphes maximum. Les mots doivent avoir un maximum de vingt mots par ligne.
    Ajoutez ${name} comme nom après les remarques.`;

    // Envoyer la requête à l'API OpenAI et récupérer la réponse

    openai
      .complete({
        engine: "text-davinci-003",
        prompt: prompt,
        maxTokens: 1000,
        temperature: 0.9,
      })
      .then(async (res) => {
        if (res.status === 200) {
          
          setLoading(false);
          // Si le statut de la réponse est 200, mettre à jour les variables d'état, créer un document PDF et l'enregistrer
          if (res.status === 200) {
            const pdfDoc = await PDFDocument.create();
            const timesRomanFont = await pdfDoc.embedFont(
              StandardFonts.TimesRoman
            );
            const page = pdfDoc.addPage([595.28, 841.89]);

            const { width, height } = page.getSize();
            const fontSize = 10;
            const margin = 50;
            let y = height - margin;
            const words = res?.data?.choices[0]?.text.split(" ");
            const lines = [];
            let line = "";

            for (const word of words) {
              if ((line + word).length > 100) {
                lines.push(line);
                line = "";
              }

              line += `${word} `;
            }

            if (line.length > 0) {
              lines.push(line);
            }

            page.drawText(lines.join("\n"), {
              x: 50,
              y: height - 4 * fontSize,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0.53, 0.71),
            });
            const pdfBytes = await pdfDoc.save();
            saveAs(new Blob([pdfBytes.buffer]), "Ma_lettre_de_motivation.pdf");
          }
        }
      })
      .catch((err) => {
        setLoading(false);
        
        Swal.fire({
          title: "Erreur !",
          text: `${err}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  // Cette fonction gère la soumission du formulaire lorsque l'utilisateur clique sur le bouton de soumission.
  // Elle empêche le comportement de soumission de formulaire par défaut et appelle la fonction generateCoverLetter 
  // avec les valeurs de saisie du formulaire en tant qu'arguments.

  const handleSubmit = async (e) => {
    e.preventDefault();

    generateCoverLetter(
      position,
      company,
      degree,
      experience,
      specialtyOne,
      specialtyTwo
    );
  };

  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-20">
        <h1 className="text-2xl sm:text-2xl md:text-3xl sm:text-2xl font-bold text-center blue-text">
          Générateur de lettre de motivation
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-3/4 md:w-1/2 p-4 border rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="name"
              >
                Nom
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="text"
                placeholder="Entrez votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="company"
              >
                Nom de l'entreprise à laquelle vous postulez
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="text"
                placeholder="Entrez le nom de l'entreprise"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="degree"
              >
                Poste auquel vous postulez
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="text"
                placeholder="Développeur Frontend"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="degree"
              >
                Diplôme
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="text"
                placeholder="Mathématiques"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="experience"
              >
                Années d'expérience(s)
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="number"
                placeholder="3"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="specialtyOne"
              >
                Compétence
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="text"
                placeholder="JavaScript"
                value={specialtyOne}
                onChange={(e) => setSpecialtyOne(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label
                className="block mb-2 font-bold text-gray-700"
                htmlFor="specialtyTwo"
              >
                Compétence supplémentaire
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                type="text"
                placeholder="Figma"
                value={specialtyTwo}
                onChange={(e) => setSpecialtyTwo(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-center mb-20">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                {loading ? "Chargement..." : "Générer la lettre de motivation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
