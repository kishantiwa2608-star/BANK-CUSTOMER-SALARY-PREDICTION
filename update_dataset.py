import csv
path = 'dataset/Churn_Modelling.csv'
names = ['Aman','Amrish','Swayam','Sonu','Vikash','Anjali','Radha','Aparan','Isha']
with open(path, newline='', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

fieldnames = list(rows[0].keys()) if rows else []
if 'Geography' in fieldnames:
    fieldnames[fieldnames.index('Geography')] = 'Country'

for i, row in enumerate(rows):
    row['Surname'] = names[i % len(names)]

with open(path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print('updated', len(rows), 'rows')
