const std = @import("std");

pub fn main() !void {
    try std.fs.File.stdout().writeAll("sandboxd stub\n");
}
