import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class AccountSettingsScreen extends StatelessWidget {
  const AccountSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text('Account Settings'),
          backgroundColor: Colors.white,
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: const BorderSide(color: Colors.grey, width: 0.2),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Deactivate Account",style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(
                          height: 16,
                        ),
                        const Text(
                            "All the content that you have posted on the GoodGut app will be hidden. To restore your account, you will need to write to support@goodgut.com"),
                        const SizedBox(
                          height: 16,
                        ),
                        GestureDetector(
                            child: const Text(
                              "Deactivate your Account",
                              style: TextStyle(
                                  color: Color.fromARGB(255, 173, 12, 0),
                                  fontWeight: FontWeight.bold),
                            ),
                            onTap: () {
                              debugPrint("testing");
                            })
                      ],
                    ),
                  )),
              const SizedBox(height: 16.0),
              Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: const BorderSide(color: Colors.grey, width: 0.2),
                  ),
                  color: Colors.white,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Delete Account", style: TextStyle(fontWeight: FontWeight.bold),),
                        const SizedBox(
                          height: 16,
                        ),
                        const Text(
                            "Deleting your account will completely remove all your posts and details from the GoodGut app. You cannot recover your account once it is deleted. However, you can use the same email or phone to create a fresh account."),
                        const SizedBox(
                          height: 16,
                        ),
                        GestureDetector(
                            child: const Text(
                              "Delete your Account",
                              style: TextStyle(
                                  color: Color.fromARGB(255, 173, 12, 0),
                                  fontWeight: FontWeight.bold),
                            ),
                            onTap: () {
                              debugPrint("testing");
                            })
                      ],
                    ),
                  )),
            ],
          ),
        ));
  }
}
