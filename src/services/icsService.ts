
import { FiscalEvent } from "../modules/tools/types/Tool";

export const icsService = {
  generateIcsContent: (event: FiscalEvent): string => {
    const formatDate = (dateStr: string) => dateStr.replace(/-/g, '');
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Date de l'événement (jour entier)
    const startDate = formatDate(event.date);
    // Fin = jour suivant
    const nextDay = new Date(event.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = formatDate(nextDay.toISOString().split('T')[0]);

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ComptaLink//FiscalCalendar//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}-${now}@comptalink.dz
DTSTAMP:${now}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description} - Voir plus sur ComptaLink
URL:${event.formLink || ''}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P2D
DESCRIPTION:Rappel échéance fiscale: ${event.title}
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
  },

  downloadIcs: (event: FiscalEvent) => {
    const content = icsService.generateIcsContent(event);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `echeance_${event.date}_${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
