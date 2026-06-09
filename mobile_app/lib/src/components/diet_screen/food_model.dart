class FoodItemModel {
  final String name;
  final String quantity;
  final String kcal;
  final String p;
  final String c;
  final String f;
  final String image;
  final bool isVeg;
  bool isSelected;
  final String mealType;
  final int? mealId;

  FoodItemModel({
    required this.name,
    required this.quantity,
    required this.kcal,
    required this.p,
    required this.c,
    required this.f,
    required this.image,
    required this.isVeg,
    this.isSelected = false,
    required this.mealType,
    this.mealId,
  });

  factory FoodItemModel.fromJson(Map<String, dynamic> json) {
    return FoodItemModel(
      name: json['name'],
      quantity: json['quantity'],
      kcal: json['kcal'],
      p: json['p'],
      c: json['c'],
      f: json['f'],
      image: json['image'],
      isVeg: json['isVeg'],
      isSelected: json['isSelected'] ?? false,
      mealType: json['mealType']?.toString() ?? 'Other',
      mealId: int.tryParse(json['mealId']?.toString() ?? ''),
    );
  }
}
