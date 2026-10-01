import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import FolkManifesto from '../components/FolkManifesto';
import StandaloneDate from '../components/StandaloneDate';
import ExperienceCarousel from '../components/ExperienceCarousel';
import TicketPasses from '../components/TicketPasses';
import VenueMap from '../components/VenueMap';
import VisualPhotoEssay from '../components/VisualPhotoEssay';
import OrganisersContact from '../components/OrganisersContact';
import FaqSection from '../components/FaqSection';
import { getFestivalContent, subscribeToCms } from '../lib/contentStore';

export default function HomePage({ onOpenBooking, onNavigate, currentUser }) {
  const [content, setContent] = useState(getFestivalContent());

  useEffect(() => {
    setContent(getFestivalContent());
    const unsub = subscribeToCms(() => {
      setContent(getFestivalContent());
    });
    return unsub;
  }, []);

  return (
    <main>
      <Hero
        heroData={content.hero}
        onOpenBooking={onOpenBooking}
        onNavigate={onNavigate}
        currentUser={currentUser}
      />
      <FolkManifesto manifestoData={content.manifesto} />
      <StandaloneDate
        dateData={content.dateSection}
        onOpenBooking={onOpenBooking}
        currentUser={currentUser}
      />
      <ExperienceCarousel experiencesData={content.experiences} />
      {/* ARENA DANCE SLOTS GARBA CIRCLE TRACK SELECTOR SECTION REMOVED AS REQUESTED */}
      <TicketPasses
        weatherData={content.weather}
        onSelectPass={(title, price) => onOpenBooking(title, price)}
        currentUser={currentUser}
      />
      <VenueMap venueData={content.venue} />
      <VisualPhotoEssay galleryData={content.gallery} />
      <OrganisersContact organisersData={content.organisers} />
      <FaqSection faqsData={content.faqs} />
    </main>
  );
}
