Depends on 001-pass.

@bash
if [ -f "../001-pass/pass.txt" ]; then echo "Dep ended" > pass.txt; else echo "Waiting" && exit 1; fi

@validate
- [pass.txt](pass.txt)
