Notes about restoring:
- employee.json is the file used by mgeneratejs to create the initial data.
- output.json is the output from that process.
- You shouldn't need to use these. Instead, uncompress dump.zip, and then use mongorestore to import the employees_secured.bson to whichever collection you need. As of this writing, employees, employees_secured, and employees_secured2 should all have identical data.
