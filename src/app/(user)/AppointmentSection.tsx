
import { Calendar, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const AppointmentSection = () => {
    return (
        <section className="py-16 md:py-24 bg-primary">
            <div className="container mx-auto px-4 text-center">
                <p className="text-[11px] tracking-[0.3em] uppercase font-body text-gold mb-3">Privae Studio</p>
                <h2 className="font-heading text-3xl md:text-5xl text-primary-foreground mb-6 heading-rule">
                    An Hour Set Aside For You
                </h2>
                <p className="text-primary-foreground/80 font-body text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
                    Step into our Jaipur atelier for a private styling appointment — fabrics laid out,
                    silhouettes considered, every detail attended to. By appointment only.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
                    <div className="flex items-center gap-3 text-primary-foreground/80">
                        <MapPin size={18} />
                        <span className="text-sm font-body">Jaipur, Rajasthan</span>
                    </div>
                    <div className="flex items-center gap-3 text-primary-foreground/80">
                        <Phone size={18} />
                        <span className="text-sm font-body">+91 7023117408</span>
                    </div>
                    <div className="flex items-center gap-3 text-primary-foreground/80">
                        <Calendar size={18} />
                        <span className="text-sm font-body">10 AM – 7 PM · By Appointment</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Link
                        href="/appointment"
                        className="inline-flex items-center gap-2 bg-gold text-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-gold/90 transition-all duration-300"
                    >
                        <MapPin size={14} /> Book Studio Appointment
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AppointmentSection;
