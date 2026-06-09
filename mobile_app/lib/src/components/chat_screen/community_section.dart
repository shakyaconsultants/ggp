import 'package:flutter/material.dart';
import 'package:good_gut/src/components/chat_screen/chat_page.dart';
import 'package:good_gut/src/utils/slide_router.dart';

class CommunitySection extends StatefulWidget {
  const CommunitySection({super.key});

  @override
  _CommunitySectionState createState() => _CommunitySectionState();
}

class _CommunitySectionState extends State<CommunitySection> {
  final List<Map<String, dynamic>> trainerData = [
    {
      "url": "https://www.w3schools.com/w3images/avatar2.png",
      "name": "Rajat Singh",
      "subtitle": "Hey! How have you been?",
      "time": "9:15 AM"
    },
    {
      "url": "https://www.w3schools.com/w3images/avatar1.png",
      "name": "Alice Johnson",
      "subtitle": "Looking forward to our meeting!",
      "time": "10:30 AM"
    },
    {
      "url": "https://www.w3schools.com/w3images/avatar3.png",
      "name": "Michael Brown",
      "subtitle": "Can you send me the report?",
      "time": "11:00 AM"
    },
    {
      "url": "https://www.w3schools.com/w3images/avatar4.png",
      "name": "Sophia Davis",
      "subtitle": "Don't forget about the deadline!",
      "time": "1:45 PM"
    },
    {
      "url": "https://www.w3schools.com/w3images/avatar5.png",
      "name": "James Wilson",
      "subtitle": "Let's catch up later!",
      "time": "2:15 PM"
    },
    {
      "url": "https://www.w3schools.com/w3images/avatar6.png",
      "name": "Emma Garcia",
      "subtitle": "I have some updates for you.",
      "time": "3:00 PM"
    }
  ];
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: trainerData.map((data) {
            return buildMenuTile(
              data['url'],
              data['name'],
              data['subtitle'],
              data['time'],
              onTap: () {
                Navigator.push(
                  context,
                  SlideInRouter(screen: const ChatPage(nutritionistName: 'Community')),
                );
              },
            );
          }).toList(),
        ),
      ),
    );
  }
}

ListTile buildMenuTile(String url, String title, String subtitle, String time,
    {required Function onTap}) {
  return ListTile(
      onTap: onTap as void Function()?,
      leading: CircleAvatar(
        radius: 25, // Adjust the radius as needed
        backgroundImage: NetworkImage(url),
      ),
      title: Text(
        title,
        textAlign: TextAlign.start,
      ),
      subtitle: subtitle.isNotEmpty
          ? Text(
              subtitle,
              style: const TextStyle(color: Colors.grey),
              maxLines: 1,
            )
          : null,
      trailing: Text(
        time,
        style: const TextStyle(
          fontSize: 12,
        ),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 0));
}
