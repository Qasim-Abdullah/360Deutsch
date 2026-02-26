import json
from pathlib import Path


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(obj, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def uniq(lst):
    seen = set()
    out = []
    for x in lst:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def main():
    root = Path(__file__).resolve().parents[1]
    src = root / "final.json"
    out = root / "final_restructured.json"

    data = load(src)

    # start with empty target structure as requested
    target = {
        "Time_and_Date": {
            "Times_of_Day": [],
            "Weekdays": [],
            "Months": [],
            "Seasons": [],
            "Time_Units": [],
            "Time_Fractions": [],
            "Calendar_Terms": []
        },
        "Numbers_and_Quantity": {
            "Basic_Numbers": [],
            "Teens": [],
            "Tens": [],
            "Hundreds_and_Thousands": [],
            "Ordinal_Numbers": [],
            "Fractions": [],
            "Measurements": []
        },
        "Colors_and_Descriptions": {
            "Basic_Colors": [],
            "Light_and_Dark": [],
            "General_Descriptions": []
        },
        "Food_and_Drinks": {
            "Meals": [],
            "Fruits_and_Vegetables": [],
            "Meat_and_Fish": [],
            "Drinks": [],
            "Bakery_and_Grains": [],
            "Dairy_and_Eggs": [],
            "Snacks_and_Fast_Food": [],
            "Ingredients_and_Spices": []
        },
        "Home_and_Living": {
            "Housing": [],
            "Rooms": [],
            "Furniture": [],
            "Household_Items": [],
            "Appliances_and_Devices": []
        },
        "Family_and_People": {
            "Immediate_Family": [],
            "Extended_Family": [],
            "General_People": [],
            "Professions": []
        },
        "Personal_Data_and_Identity": {
            "Personal_Information": [],
            "Documents": [],
            "Nationality_and_Countries": []
        },
        "School_and_Work": {
            "School": [],
            "Work": []
        },
        "Shopping_and_Money": {
            "Shops_and_Places": [],
            "Money_and_Payments": [],
            "Products": []
        },
        "Travel_and_Transport": {
            "Transport_Means": [],
            "Travel_Places": [],
            "Travel_Events": [],
            "Tickets_and_Documents": []
        },
        "Health_and_Body": {
            "Body_Parts": [],
            "Health_Problems": [],
            "Medical_Places_and_People": [],
            "Hygiene": []
        },
        "Nature_and_Environment": {
            "Weather": [],
            "Nature": [],
            "Animals": []
        },
        "Communication_and_Media": {
            "Communication_Forms": [],
            "Devices": [],
            "Media": []
        },
        "Feelings_and_States": {
            "Emotions": [],
            "Physical_States": []
        },
        "Leisure_and_Sports": {
            "Hobbies": [],
            "Sports": []
        },
        "Clothes": {"Clothing_Items": []},
        "Daily_Routine": {"Daily_Actions": []},
        "Grammar_and_Function_Words": {
            "Articles": [],
            "Pronouns": [],
            "Prepositions": [],
            "Conjunctions": [],
            "Adverbs": [],
            "Question_Words": []
        },
        "Common_Verbs": {
            "Basic_Verbs": [],
            "Modal_Verbs": [],
            "Separable_Verbs": []
        },
        "Other_Important_Words": {"General": []}
    }

    placed = set()

    # helper to take from source if present
    def take(src_path, dest_list):
        node = data
        for key in src_path:
            node = node.get(key, {})
        if isinstance(node, list):
            dest_list.extend(node)
            for x in node:
                placed.add(x)

    # Map existing fields to the requested structure
    # Time and date
    take(["Time_and_Date", "Times_of_Day"], target["Time_and_Date"]["Times_of_Day"])
    take(["Time_and_Date", "Weekdays"], target["Time_and_Date"]["Weekdays"])
    take(["Time_and_Date", "Months"], target["Time_and_Date"]["Months"])
    take(["Time_and_Date", "Seasons"], target["Time_and_Date"]["Seasons"])
    take(["Time_and_Date", "Time_Units"], target["Time_and_Date"]["Time_Units"])
    take(["Time_and_Date", "Time_Fractions"], target["Time_and_Date"]["Time_Fractions"])
    take(["Time_and_Date", "Calendar_Terms"], target["Time_and_Date"]["Calendar_Terms"])

    # Numbers
    take(["Numbers", "Basic_Numbers_0_to_10"], target["Numbers_and_Quantity"]["Basic_Numbers"])
    take(["Numbers", "Teens_11_to_19"], target["Numbers_and_Quantity"]["Teens"])
    take(["Numbers", "Tens_20_to_90"], target["Numbers_and_Quantity"]["Tens"])
    take(["Numbers", "Hundreds"], target["Numbers_and_Quantity"]["Hundreds_and_Thousands"])
    take(["Numbers", "Ordinal_Numbers"], target["Numbers_and_Quantity"]["Ordinal_Numbers"])
    take(["Numbers", "Fractions"], target["Numbers_and_Quantity"]["Fractions"])

    # Colors
    take(["Colors", "Basic_Colors"], target["Colors_and_Descriptions"]["Basic_Colors"])
    take(["Colors", "Light_and_Dark"], target["Colors_and_Descriptions"]["Light_and_Dark"])
    take(["Colors", "Color_Descriptions"], target["Colors_and_Descriptions"]["General_Descriptions"])

    # Food
    take(["Food_and_Drinks", "Meals_and_Dining"], target["Food_and_Drinks"]["Meals"])
    take(["Food_and_Drinks", "Fruits_and_Vegetables"], target["Food_and_Drinks"]["Fruits_and_Vegetables"])
    take(["Food_and_Drinks", "Meat_and_Fish"], target["Food_and_Drinks"]["Meat_and_Fish"])
    take(["Food_and_Drinks", "Drinks"], target["Food_and_Drinks"]["Drinks"])
    take(["Food_and_Drinks", "Bakery_and_Grains"], target["Food_and_Drinks"]["Bakery_and_Grains"])
    take(["Food_and_Drinks", "Dairy_and_Eggs"], target["Food_and_Drinks"]["Dairy_and_Eggs"])
    take(["Food_and_Drinks", "Fast_Food_and_Snacks"], target["Food_and_Drinks"]["Snacks_and_Fast_Food"])
    take(["Food_and_Drinks", "Spices_and_Ingredients"], target["Food_and_Drinks"]["Ingredients_and_Spices"])

    # Home and living
    # Rooms: collect all items from subrooms into Rooms list and distribute
    rooms = data.get("Home_and_Living", {}).get("Rooms", {})
    for rname, items in rooms.items():
        # add room name to Rooms
        target["Home_and_Living"]["Rooms"].append(rname)
        for it in items:
            # simple heuristics: appliance keywords
            low = it.lower()
            if any(k in low for k in ("kühlschrank", "waschmaschine", "herd", "spüle", "fernseher")):
                target["Home_and_Living"]["Appliances_and_Devices"].append(it)
            elif any(k in low for k in ("stuhl", "tisch", "sofa", "schrank", "bett", "teppich", "regal")):
                target["Home_and_Living"]["Furniture"].append(it)
            else:
                target["Home_and_Living"]["Household_Items"].append(it)
            placed.add(it)

    take(["Home_and_Living", "Housing_and_Buildings"], target["Home_and_Living"]["Housing"])
    take(["Home_and_Living", "Home_Actions"], target["Home_and_Living"]["Household_Items"])

    # Family and people
    take(["Family_and_Relationships", "Immediate_Family"], target["Family_and_People"]["Immediate_Family"])
    take(["Family_and_Relationships", "Extended_Family"], target["Family_and_People"]["Extended_Family"])
    take(["Family_and_Relationships", "General_People"], target["Family_and_People"]["General_People"])
    take(["Professions"], target["Family_and_People"]["Professions"])

    # Personal data
    take(["Personal_Data", "Personal_Information"], target["Personal_Data_and_Identity"]["Personal_Information"])
    take(["Personal_Data", "Identity_Documents"], target["Personal_Data_and_Identity"]["Documents"])
    take(["Personal_Data", "Nationality_and_Region"], target["Personal_Data_and_Identity"]["Nationality_and_Countries"])

    # School and work
    take(["School_and_Work"], target["School_and_Work"]["School"])  # original top-level is a list
    # additionally, final.json has School_and_Work as list; try existing key
    if "School_and_Work" in data and isinstance(data["School_and_Work"], list):
        for x in data["School_and_Work"]:
            target["School_and_Work"]["School"].append(x)
            placed.add(x)
    # Work items present in School_and_Work
    # also copy School_and_Work -> Work if includes work terms
    for x in target["School_and_Work"]["School"]:
        low = x.lower()
        if any(k in low for k in ("arbeit", "job", "firma", "arbeitsplatz")):
            target["School_and_Work"]["Work"].append(x)

    # Shopping and money
    take(["Shopping_and_Supermarket"], target["Shopping_and_Money"]["Shops_and_Places"])
    take(["Money_and_Prices"], target["Shopping_and_Money"]["Money_and_Payments"])

    # Travel
    take(["Travel_and_Transport", "Transport_Means"], target["Travel_and_Transport"]["Transport_Means"])
    take(["Travel_and_Transport", "Infrastructure_Places"], target["Travel_and_Transport"]["Travel_Places"])
    take(["Travel_and_Transport", "Travel_Events"], target["Travel_and_Transport"]["Travel_Events"])
    take(["Travel_and_Transport", "Tickets_and_Entry"], target["Travel_and_Transport"]["Tickets_and_Documents"])

    # Health and body
    take(["Health_and_Body", "Body_Parts"], target["Health_and_Body"]["Body_Parts"])
    take(["Health_and_Body", "Health_and_Medical"], target["Health_and_Body"]["Health_Problems"])
    take(["Health_and_Body", "Facilities_and_Places"], target["Health_and_Body"]["Medical_Places_and_People"])
    take(["Health_and_Body", "Hygiene_and_Selfcare"], target["Health_and_Body"]["Hygiene"])

    # Nature
    take(["Nature_and_Environment", "Nature_and_Weather"], target["Nature_and_Environment"]["Nature"])
    take(["Nature_and_Environment", "Weather_Actions"], target["Nature_and_Environment"]["Weather"])
    take(["Animals"], target["Nature_and_Environment"]["Animals"]) if "Animals" in data else None

    # Communication and media
    take(["Communication_and_Information", "Messages_and_Documents"], target["Communication_and_Media"]["Communication_Forms"])
    take(["Technology_and_Media", "Devices_and_Hardware"], target["Communication_and_Media"]["Devices"]) if "Technology_and_Media" in data else None
    take(["Technology_and_Media", "Media_and_Content"], target["Communication_and_Media"]["Media"]) if "Technology_and_Media" in data else None
    take(["Communication_and_Information", "Telephone_and_Calls"], target["Communication_and_Media"]["Communication_Forms"])

    # Feelings
    take(["Feelings_and_Emotions"], target["Feelings_and_States"]["Emotions"]) if "Feelings_and_Emotions" in data else None
    # Physical states from Health_and_Body Physical_Condition
    take(["Health_and_Body", "Physical_Condition"], target["Feelings_and_States"]["Physical_States"])

    # Leisure and sports
    take(["Hobbies_and_Free_Time"], target["Leisure_and_Sports"]["Hobbies"])
    take(["Sports"], target["Leisure_and_Sports"]["Sports"]) if "Sports" in data else None

    # Clothes
    take(["Clothes"], target["Clothes"]["Clothing_Items"])

    # Daily routine
    if "Daily_Routine" in data:
        if isinstance(data["Daily_Routine"], list):
            target["Daily_Routine"]["Daily_Actions"].extend(data["Daily_Routine"])
            for x in data["Daily_Routine"]: placed.add(x)

    # Grammar and pronouns from Personal_Data
    take(["Personal_Data", "Pronouns_and_References"], target["Grammar_and_Function_Words"]["Pronouns"])

    # Verbs: collect many *_Actions lists across data
    for key in data:
        if isinstance(data[key], dict):
            for subk, subv in data[key].items():
                if subk.lower().endswith("actions") and isinstance(subv, list):
                    target["Common_Verbs"]["Basic_Verbs"].extend(subv)
                    for x in subv: placed.add(x)

    # Other important words
    if "Other_Important_Words" in data:
        take(["Other_Important_Words"], target["Other_Important_Words"]["General"])

    # Now collect any items from top-level lists that weren't captured
    # Also collect any stray words nested in lists
    def collect_all_words(node):
        words = []
        if isinstance(node, list):
            words.extend(node)
        elif isinstance(node, dict):
            for v in node.values():
                words.extend(collect_all_words(v))
        return words

    all_words = collect_all_words(data)
    leftovers = [w for w in all_words if w not in placed]
    target["Other_Important_Words"]["General"].extend(leftovers)

    # Clean duplicates
    def clean(t):
        if isinstance(t, dict):
            return {k: clean(v) for k, v in t.items()}
        elif isinstance(t, list):
            return uniq(t)
        else:
            return t

    target = clean(target)

    save(target, out)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
