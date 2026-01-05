Always fail tests.

@bash
echo "temp" > temp.txt

@validate
- [pass.txt](pass.txt)
