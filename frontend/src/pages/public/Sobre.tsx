import PublicLayout from "../../layouts/PublicLayout";
import fachada from "../../layouts/images/fachada.png";

function Sobre() {
  return (
    <PublicLayout>
      <div className="bg-navy-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-gold-300 text-sm font-medium tracking-widest uppercase mb-2">
            Nossa história
          </p>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sobre o Barra Hotel
          </h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-3 py-14 space-y-12">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-slate-800 leading-relaxed text-justify mb-4  ">
              O Barra Hotel nasceu do sonho de proporcionar uma experiência de hospedagem acolhedora e 
              diferenciada em Vargem Grande do Sul, interior de São Paulo. Com mais de 5 anos de história, 
              construímos nossa trajetória com dedicação, compromisso e excelência, oferecendo conforto, 
              segurança e qualidade em cada estadia.
            </p>
            <p className="text-slate-800 leading-relaxed text-justify">
              Nossa equipe está preparada para receber cada hóspede com atenção, cordialidade 
              e atendimento personalizado. Valorizamos cada detalhe para criar um ambiente 
              acolhedor, onde nossos visitantes possam se sentir em casa e desfrutar de 
              momentos de tranquilidade e bem-estar.
            </p>
          </div>
          <img
            src={fachada}
            alt="Hotel"
            className="rounded-2xl w-full h-110 object-cover opacity-100"
          />
        </div>
        </div>
    </PublicLayout>
  );
}
export default Sobre;
