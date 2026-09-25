import Foundation
import AppKit
import CoreGraphics

guard CommandLine.arguments.count >= 4 else {
  fputs("usage: 2026.09.02_MergePdfPages.swift output.pdf page-1.png page-2.png [...]\n", stderr)
  exit(2)
}
let outputURL = URL(fileURLWithPath: CommandLine.arguments[1]) as CFURL
var defaultBox = CGRect(x: 0, y: 0, width: 612, height: 792)
guard let consumer = CGDataConsumer(url: outputURL),
      let context = CGContext(consumer: consumer, mediaBox: &defaultBox, nil) else {
  fatalError("could not create output PDF")
}
var count = 0
for path in CommandLine.arguments.dropFirst(2) {
  guard let image = NSImage(contentsOfFile: path),
        let source = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fatalError("could not open \(path)")
  }
  var box = defaultBox
  let boxData = NSData(bytes: &box, length: MemoryLayout<CGRect>.size)
  context.beginPDFPage([kCGPDFContextMediaBox: boxData] as CFDictionary)
  context.saveGState()
  context.interpolationQuality = .high
  context.draw(source, in: box)
  context.restoreGState()
  context.endPDFPage()
  count += 1
}
context.closePDF()
print("\(outputURL): \(count) pages")
