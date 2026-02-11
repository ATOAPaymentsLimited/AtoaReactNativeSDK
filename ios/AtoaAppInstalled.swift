import Foundation
import UIKit

@objc(AtoaAppInstalled)
class AtoaAppInstalled: NSObject {

    @objc
    func isAppInstalled(_ urlScheme: String,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        DispatchQueue.main.async {
            let scheme = urlScheme.contains("://") ? urlScheme : "\(urlScheme)://"
            guard let url = URL(string: scheme) else {
                resolve(false)
                return
            }
            let canOpen = UIApplication.shared.canOpenURL(url)
            resolve(canOpen)
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
