import 'package:flutter/material.dart';

class TermsAndConditions extends StatelessWidget {
  const TermsAndConditions({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
       appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
        centerTitle: true,
        titleTextStyle: const TextStyle(
            color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
        title: const Text('Terms and Conditions'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Terms and Conditions',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            buildParagraph(
              'Welcome to the Good Gut Project mobile application (the “App”). The App is operated by TKSV Food Health Solutions Pvt Ltd, '
              'located at 64 Rajendra Nagar, Naubasta, Kanpur 208021, Uttar Pradesh, India. By downloading or using this App, you agree to comply '
              'with and be bound by the following terms and conditions (the “Terms”). Please review them carefully before using the App.',
            ),
            buildSectionTitle('2. Services Provided'),
            buildParagraph(
              'The App provides users with nutrition-related services, including but not limited to personalized meal plans, dietary advice, health '
              'tracking features, and product recommendations (the “Services”). All Services are intended for informational purposes and are not '
              'meant to replace professional medical advice.',
            ),
            buildSectionTitle('3. User Registration and Responsibilities'),
            buildParagraph(
              'To access certain features of the App, you may be required to register by providing personal details. By registering, you agree that:\n'
              '- All information you provide will be accurate and up-to-date.\n'
              '- You are responsible for maintaining the confidentiality of your account and password.\n'
              '- You agree to notify us of any unauthorized use of your account.',
            ),
            buildSectionTitle('4. Use of the App'),
            buildParagraph(
              'You agree to use the App only for lawful purposes and in accordance with these Terms. You shall not use the App:\n'
              '- For any fraudulent or unlawful activity.\n'
              '- To transmit any viruses or malicious code.\n'
              '- To collect or store personal data about other users.',
            ),
            buildSectionTitle('5. Medical Disclaimer'),
            buildParagraph(
              'The content provided through the Good Gut Project App is for educational and informational purposes only. It does not constitute medical '
              'advice, diagnosis, or treatment. Always consult with a qualified healthcare professional before making any changes to your diet or health regimen.',
            ),
            buildSectionTitle('6. Payments and Subscriptions'),
            buildParagraph(
              'The App may offer paid Services, which will be available either as one-time purchases or through subscription plans. By purchasing a '
              'Service, you agree to pay the fees listed at the time of purchase. Subscription payments will be automatically renewed unless canceled before the renewal date.',
            ),
            buildSectionTitle('7. Intellectual Property'),
            buildParagraph(
              'All content, including text, images, software, and design elements, are the property of TKSV Food Health Solutions Pvt Ltd unless otherwise '
              'stated. Unauthorized use, reproduction, or distribution of this content is strictly prohibited.',
            ),
            buildSectionTitle('8. Limitation of Liability'),
            buildParagraph(
              'In no event shall TKSV Food Health Solutions Pvt Ltd, its directors, employees, or agents be liable for any indirect, incidental, special, '
              'or consequential damages arising from the use or inability to use the App.',
            ),
            buildSectionTitle('9. Privacy Policy'),
            buildParagraph(
              'We are committed to protecting your privacy. Please refer to our Privacy Policy, available at goodgutproject.in/privacy, for information '
              'on how we collect, use, and disclose your personal information.',
            ),
            buildSectionTitle('10. Termination'),
            buildParagraph(
              'We reserve the right to terminate or suspend your access to the App at our sole discretion, without notice, for conduct that we believe '
              'violates these Terms or is harmful to other users.',
            ),
            buildSectionTitle('11. Governing Law'),
            buildParagraph(
              'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with '
              'these Terms will be subject to the exclusive jurisdiction of the courts located in Kanpur, Uttar Pradesh.',
            ),
            buildSectionTitle('12. Modifications to the Terms'),
            buildParagraph(
              'We may modify these Terms at any time, and such modifications shall be effective immediately upon posting. It is your responsibility to review these Terms periodically for updates.',
            ),
            const SizedBox(height: 24),
            const Text(
              'Contact Information:',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            buildParagraph(
              'If you have any questions about these Terms, please contact us at:\n\n'
              '- Phone: 9236381615\n'
              '- Address: 64 Rajendra Nagar, Naubasta, Kanpur 208021\n'
              '- Website: goodgutproject.in\n'
              '- Email: support@goodgutproject.in',
            ),
          ],
        ),
      ),
    );
  }

  Widget buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget buildParagraph(String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        content,
        style: const TextStyle(
          fontSize: 16,
          height: 1.5,
        ),
      ),
    );
  }
}
