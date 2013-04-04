PKGFILE:=goto-godoc-extension.zip
FILES:=$(wildcard *.png *.json *.js)

all: $(PKGFILE)

$(PKGFILE): $(FILES)
	$(RM) $@
	zip $@ $^

clean:
	$(RM) $(PKGFILE)
