#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath, isDirectory: true)
let sourceURL = root.appendingPathComponent("images/m-cropped.png")
guard
    let imageSource = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
    let source = CGImageSourceCreateImageAtIndex(imageSource, 0, nil)
else {
    fatalError("Could not read canonical mark at \(sourceURL.path)")
}

let exports: [(size: Int, name: String)] = [
    (16, "favicon-16x16.png"),
    (32, "favicon-32x32.png"),
    (48, "favicon-48x48.png"),
    (180, "apple-touch-icon.png"),
    (192, "favicon-192x192.png"),
    (512, "favicon-512x512.png")
]

func centeredDimension(_ proposed: Int, in canvas: Int) -> Int {
    proposed % 2 == canvas % 2 ? proposed : proposed - 1
}

func render(size: Int) -> Data {
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(
        data: nil,
        width: size,
        height: size,
        bitsPerComponent: 8,
        bytesPerRow: size * 4,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
        fatalError("Could not create \(size)px render context")
    }

    context.interpolationQuality = .high
    context.setShouldAntialias(true)
    let width = centeredDimension(Int((Double(size) * 0.8).rounded()), in: size)
    let aspectRatio = Double(source.height) / Double(source.width)
    let height = centeredDimension(Int((Double(width) * aspectRatio).rounded()), in: size)
    let target = CGRect(
        x: (size - width) / 2,
        y: (size - height) / 2,
        width: width,
        height: height
    )
    context.draw(source, in: target)

    guard
        let rendered = context.makeImage(),
        let output = CFDataCreateMutable(nil, 0),
        let destination = CGImageDestinationCreateWithData(output, "public.png" as CFString, 1, nil)
    else {
        fatalError("Could not encode \(size)px PNG")
    }
    CGImageDestinationAddImage(destination, rendered, nil)
    guard CGImageDestinationFinalize(destination) else {
        fatalError("Could not finalize \(size)px PNG")
    }
    return output as Data
}

var pngs: [Int: Data] = [:]
for export in exports {
    let png = render(size: export.size)
    pngs[export.size] = png
    try png.write(to: root.appendingPathComponent(export.name), options: .atomic)
}

func appendUInt16(_ value: UInt16, to data: inout Data) {
    var littleEndian = value.littleEndian
    withUnsafeBytes(of: &littleEndian) { data.append(contentsOf: $0) }
}

func appendUInt32(_ value: UInt32, to data: inout Data) {
    var littleEndian = value.littleEndian
    withUnsafeBytes(of: &littleEndian) { data.append(contentsOf: $0) }
}

let icoSizes = [16, 32, 48]
var ico = Data()
appendUInt16(0, to: &ico)
appendUInt16(1, to: &ico)
appendUInt16(UInt16(icoSizes.count), to: &ico)
var offset = 6 + (16 * icoSizes.count)
for size in icoSizes {
    guard let png = pngs[size] else { fatalError("Missing \(size)px ICO frame") }
    ico.append(UInt8(size))
    ico.append(UInt8(size))
    ico.append(0)
    ico.append(0)
    appendUInt16(1, to: &ico)
    appendUInt16(32, to: &ico)
    appendUInt32(UInt32(png.count), to: &ico)
    appendUInt32(UInt32(offset), to: &ico)
    offset += png.count
}
for size in icoSizes { ico.append(pngs[size]!) }
try ico.write(to: root.appendingPathComponent("favicon.ico"), options: .atomic)

print("Rendered favicons from \(sourceURL.lastPathComponent): \(exports.map { String($0.size) }.joined(separator: ", "))px; ICO: 16, 32, 48px")
