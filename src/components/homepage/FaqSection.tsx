
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus } from 'lucide-react';

interface FaqSectionProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  return (
    <section className="py-20 bg-crypto-dark relative">
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 to-transparent opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-500 to-purple-400">Questions</span>
          </h2>
          <p className="text-crypto-light max-w-2xl mx-auto">
            Find answers to common questions about creating and launching tokens with Infinity Launch
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-5 text-white text-lg hover:no-underline hover:bg-white/5 flex justify-between">
                  <span>{faq.question}</span>
                  <Plus className="shrink-0 text-purple-400 transition-transform duration-200" />
                </AccordionTrigger>
                <AccordionContent className="px-6 py-5 text-crypto-light">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-crypto-light">
            Still have questions? <a href="https://discord.gg/r2bNMrHrh6" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Join our Discord community</a> for more help.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
