"use client";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";

export default function TermsPage() {
  return (
    <PageContainer>
      <div className="px-4 pt-6 pb-8 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="text-gray-500 hover:text-gray-700">
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
        </div>

        <div className="prose prose-sm text-gray-700 space-y-4">
          <p className="text-xs text-gray-400">Last updated: February 2026</p>

          <section>
            <h2 className="text-base font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using NutriTrack, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the application.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">2. Health & Medical Disclaimer</h2>
            <p>
              NutriTrack is designed for informational and educational purposes only. The nutrition
              information, calorie estimates, and other data provided by this application are
              <strong> not intended as medical advice, diagnosis, or treatment</strong>.
            </p>
            <p>
              AI-generated nutrition estimates are approximations and may contain inaccuracies.
              Data sourced from the USDA database, while generally reliable, may not reflect the
              exact nutritional content of the specific food you consume due to variations in
              preparation, portion size, and product formulation.
            </p>
            <p>
              Always consult a qualified healthcare professional, registered dietitian, or
              nutritionist before making dietary changes, especially if you have allergies,
              medical conditions, or are taking medication.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">3. No Professional Advice</h2>
            <p>
              NutriTrack does not provide professional dietary, medical, or health advice. The
              application should not be used as a substitute for consultation with qualified
              healthcare providers. Reliance on any information provided by this application is
              solely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">4. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, NutriTrack and its developers
              shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of health, personal injury,
              or any damages arising from your use of or inability to use the application.
            </p>
            <p>
              NutriTrack makes no warranties or representations about the accuracy, reliability,
              completeness, or timeliness of the nutrition data, AI estimates, or any other
              content provided through the application.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">5. AI-Generated Content</h2>
            <p>
              This application uses artificial intelligence to estimate nutritional information.
              AI-generated content may be inaccurate, incomplete, or outdated. You should
              independently verify any AI-generated nutrition data before relying on it for
              dietary decisions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">6. Data Accuracy</h2>
            <p>
              While we strive to provide accurate information through the USDA FoodData Central
              database and other sources, we cannot guarantee the accuracy of all nutritional
              data. Food composition can vary based on brand, preparation method, growing
              conditions, and other factors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">7. User Responsibility</h2>
            <p>
              You are solely responsible for your dietary choices and health decisions. By using
              NutriTrack, you acknowledge that you understand the limitations of automated
              nutrition tracking and agree to use the application responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">8. Goal Calculations</h2>
            <p>
              Goal calculations use standard population-based formulas (Mifflin-St Jeor) and are
              estimates only. Individual needs vary based on metabolism, body composition, medical
              conditions, and other factors. This is not medical advice. Always consult a qualified
              healthcare professional before making significant dietary changes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Continued use
              of the application after changes constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </div>
      <BottomNav />
    </PageContainer>
  );
}
