.PHONY: build test clean run

ZIG ?= zig
OPTIMIZE ?= ReleaseSmall

build:
	$(ZIG) build -Doptimize=$(OPTIMIZE)

run: build
	./zig-out/bin/sandboxd

test:
	$(ZIG) build test -Doptimize=$(OPTIMIZE)

clean:
	rm -rf zig-cache zig-out
