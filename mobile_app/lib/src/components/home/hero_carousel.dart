import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:good_gut/src/app_strings.dart';
import 'package:good_gut/src/utils/api_util.dart';
import 'package:good_gut/src/utils/app_utils.dart';

class HeroCarousel extends StatefulWidget {
  const HeroCarousel({super.key});

  @override
  _HeroCarouselState createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<HeroCarousel> {
  List<Map<String, dynamic>> flyers = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchFlyers();
  }

  Future<void> fetchFlyers() async {
  
    try {
      final response =
          await ApiUtil.makeApiCall(endpoint: AppStrings.flyerURL, method: 'GET');
      print(response["status"]);
      if (response["statusCode"] == 200) {
       List<dynamic> data = response["data"];
        setState(() {
          flyers = data
              .map((flyer) => {
                    'name': flyer['name'],
                    'imageUrl': flyer['imageUrl'],
                    'link': flyer['url']
                  })
              .toList();
          isLoading = false;
        });
      } else {
        // Handle non-200 responses
        setState(() {
          isLoading = false;
        });
        debugPrint('Failed to load flyers: ${response["statusCode"]}');
      }
    } catch (error) {
      // Handle errors
      setState(() {
        isLoading = false;
      });
      debugPrint('Error fetching flyers: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (flyers.isEmpty) {
      return Container();
    }

    return CarouselSlider(
      options: CarouselOptions(
        height: 150.0,
        autoPlay: true,
        enlargeCenterPage: true,
      ),
      items: flyers.map((flyer) {
        return Builder(
          builder: (BuildContext context) {
            return GestureDetector(
              onTap: () {
                Apputils.launchExternalURL(flyer['link']);
                // Handle link navigation
                debugPrint('Flyer link: ${flyer['link']}');
              },
              child: Container(
                width: MediaQuery.of(context).size.width,
                margin: const EdgeInsets.symmetric(horizontal: 5.0),
                decoration: BoxDecoration(
                  color: Colors.grey,
                  image: flyer['imageUrl'] != null
                      ? DecorationImage(
                        invertColors: true,
                          image: NetworkImage(flyer['imageUrl']!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: flyer['imageUrl'] == null
                    ? Center(
                        child: Text(
                          flyer['name'] ?? '',
                          style: const TextStyle(
                            fontSize: 16.0,
                            color: Colors.white,
                          ),
                        ),
                      )
                    : null,
              ),
            );
          },
        );
      }).toList(),
    );
  }
}
