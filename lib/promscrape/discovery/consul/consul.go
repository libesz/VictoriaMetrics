package consul

import (
	"fmt"

	"github.com/VictoriaMetrics/VictoriaMetrics/lib/promauth"
	"github.com/VictoriaMetrics/VictoriaMetrics/lib/proxy"
)

// SDConfig represents service discovery config for Consul.
//
// See https://prometheus.io/docs/prometheus/latest/configuration/configuration/#consul_sd_config
type SDConfig struct {
	Server     string  `yaml:"server,omitempty"`
	Token      *string `yaml:"token"`
	Datacenter string  `yaml:"datacenter"`
	// Namespace only supported at enterprise consul.
	// https://www.consul.io/docs/enterprise/namespaces
	Namespace         string                     `yaml:"namespace,omitempty"`
	Scheme            string                     `yaml:"scheme,omitempty"`
	Username          string                     `yaml:"username"`
	Password          string                     `yaml:"password"`
	HTTPClientConfig  promauth.HTTPClientConfig  `yaml:",inline"`
	ProxyURL          *proxy.URL                 `yaml:"proxy_url,omitempty"`
	ProxyClientConfig promauth.ProxyClientConfig `yaml:",inline"`
	Services          []string                   `yaml:"services,omitempty"`
	Tags              []string                   `yaml:"tags,omitempty"`
	NodeMeta          map[string]string          `yaml:"node_meta,omitempty"`
	TagSeparator      *string                    `yaml:"tag_separator,omitempty"`
	AllowStale        bool                       `yaml:"allow_stale,omitempty"`
	// RefreshInterval time.Duration `yaml:"refresh_interval"`
	// refresh_interval is obtained from `-promscrape.consulSDCheckInterval` command-line option.
}

// GetLabels returns Consul labels according to sdc.
func (sdc *SDConfig) GetLabels(baseDir string) ([]map[string]string, error) {
	cfg, err := getAPIConfig(sdc, baseDir)
	if err != nil {
		return nil, fmt.Errorf("cannot get API config: %w", err)
	}
	ms := getServiceNodesLabels(cfg)
	return ms, nil
}

// MustStop stops further usage for sdc.
func (sdc *SDConfig) MustStop() {
	v := configMap.Delete(sdc)
	if v != nil {
		// v can be nil if GetLabels wasn't called yet.
		cfg := v.(*apiConfig)
		cfg.mustStop()
	}
}
